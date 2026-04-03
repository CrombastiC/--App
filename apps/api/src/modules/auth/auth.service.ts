import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // 用户登录
  async login(loginDto: LoginDto) {
    const { phone, password } = loginDto;

    // 查找用户
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    // 生成 Token
    const tokens = this.generateTokens(user.id, user.phone);

    // 返回用户信息（排除密码）
    const { password: _, ...userInfo } = user;
    return {
      ...tokens,
      user: userInfo,
    };
  }

  // 用户注册
  async register(registerDto: RegisterDto) {
    const { phone, password, username } = registerDto;

    // 检查手机号是否已注册
    const existingUser = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      throw new BadRequestException('该手机号已注册');
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        phone,
        username,
        password: hashedPassword,
      },
    });

    // 生成 Token
    const tokens = this.generateTokens(user.id, user.phone);

    // 返回用户信息（排除密码）
    const { password: _, ...userInfo } = user;
    return {
      ...tokens,
      user: userInfo,
    };
  }

  // 生成 JWT Token
  private generateTokens(userId: string, phone: string) {
    const payload = { sub: userId, phone };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
    });

    return {
      token: accessToken,
      refreshToken,
    };
  }

  // 刷新 Token
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }

      return this.generateTokens(user.id, user.phone);
    } catch (error) {
      throw new UnauthorizedException('Token 无效或已过期');
    }
  }

  // 验证 Token
  async verifyToken(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    return { valid: !!user };
  }
}
