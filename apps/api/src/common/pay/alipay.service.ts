import { Injectable, OnModuleInit } from '@nestjs/common';
import { AlipaySdk } from 'alipay-sdk';
import { ConfigService } from '@nestjs/config';
import { createPrivateKey } from 'node:crypto';

/**
 * 支付宝 SDK 服务（全局共享）
 * 负责初始化 AlipaySdk 实例，自动检测密钥格式
 */
@Injectable()
export class AlipayService implements OnModuleInit {
  public alipaySdk: AlipaySdk;

  constructor(private readonly configService: ConfigService) {}

  /**
   * 检测私钥格式（PKCS1 或 PKCS8）
   */
  private detectKeyType(privateKey: string): 'PKCS1' | 'PKCS8' {
    const raw = privateKey.trim();

    if (raw.includes('BEGIN RSA PRIVATE KEY')) return 'PKCS1';
    if (raw.includes('BEGIN PRIVATE KEY')) return 'PKCS8';

    const normalized = raw.replace(/\s+/g, '');
    const pkcs1Pem = `-----BEGIN RSA PRIVATE KEY-----\n${normalized}\n-----END RSA PRIVATE KEY-----`;
    const pkcs8Pem = `-----BEGIN PRIVATE KEY-----\n${normalized}\n-----END PRIVATE KEY-----`;

    try {
      createPrivateKey(pkcs1Pem);
      return 'PKCS1';
    } catch {
      createPrivateKey(pkcs8Pem);
      return 'PKCS8';
    }
  }

  onModuleInit() {
    const privateKey = this.configService.get<string>('ALIPAY_PRIVATE_KEY')!;
    const keyType = this.detectKeyType(privateKey);

    this.alipaySdk = new AlipaySdk({
      appId: this.configService.get<string>('ALIPAY_APP_ID')!,
      privateKey,
      alipayPublicKey: this.configService.get<string>('ALIPAY_PUBLIC_KEY')!,
      gateway: this.configService.get<string>('ALIPAY_GATEWAY')!,
      keyType,
    });
  }

  /**
   * 获取支付宝 SDK 实例
   */
  getAlipaySdk(): AlipaySdk {
    return this.alipaySdk;
  }
}
