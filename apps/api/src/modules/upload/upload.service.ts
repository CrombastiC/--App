import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Injectable()
export class UploadService {
  private uploadPath: string;

  constructor(private configService: ConfigService) {
    this.uploadPath = this.configService.get('UPLOAD_PATH', './uploads');
    // 确保上传目录存在
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadFile(file: UploadedFile): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('请选择要上传的图片');
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('仅支持上传图片文件');
    }
    // 生成唯一文件名
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}${ext}`;
    const filepath = path.join(this.uploadPath, filename);

    // 移动文件到上传目录
    fs.writeFileSync(filepath, file.buffer);

    // 返回相对路径，前端自行拼接 base URL
    return { url: `/uploads/${filename}` };
  }
}
