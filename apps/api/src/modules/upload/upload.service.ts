import { Injectable } from '@nestjs/common';
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
    // 生成唯一文件名
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${timestamp}${ext}`;
    const filepath = path.join(this.uploadPath, filename);

    // 移动文件到上传目录
    fs.writeFileSync(filepath, file.buffer);

    // 返回访问 URL
    const baseUrl = this.configService.get('BASE_URL', 'http://localhost:5000');
    return { url: `${baseUrl}/uploads/${filename}` };
  }
}
