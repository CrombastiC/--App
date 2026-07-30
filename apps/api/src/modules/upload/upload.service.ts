import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'node:crypto';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface UploadedSupportAttachment {
  url: string;
  name: string;
  size: number;
  mimeType: string;
  messageType: 'image' | 'file';
}

const SUPPORT_FILE_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'text/csv',
]);

const SUPPORT_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const SUPPORT_FILE_EXTENSIONS = new Set([
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.txt',
  '.csv',
  '.zip',
]);

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
    return { url: this.saveFile(file) };
  }

  uploadSupportAttachment(file: UploadedFile): UploadedSupportAttachment {
    if (!file) throw new BadRequestException('请选择要发送的文件');
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('文件大小不能超过 10MB');
    }

    const isImage = SUPPORT_IMAGE_MIME_TYPES.has(file.mimetype);
    const extension = path.extname(file.originalname).toLowerCase();
    const isAllowedFile =
      SUPPORT_FILE_MIME_TYPES.has(file.mimetype) ||
      (file.mimetype === 'application/octet-stream' &&
        SUPPORT_FILE_EXTENSIONS.has(extension));
    if (!isImage && !isAllowedFile) {
      throw new BadRequestException('不支持该文件格式');
    }

    return {
      url: this.saveFile(file),
      name: path.basename(file.originalname),
      size: file.size,
      mimeType: file.mimetype,
      messageType: isImage ? 'image' : 'file',
    };
  }

  private saveFile(file: UploadedFile) {
    const ext = path.extname(file.originalname).toLowerCase().slice(0, 12);
    const filename = `${Date.now()}-${randomUUID()}${ext}`;
    fs.writeFileSync(path.join(this.uploadPath, filename), file.buffer);
    return `/uploads/${filename}`;
  }
}
