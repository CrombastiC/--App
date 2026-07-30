import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
import { resolve } from 'path';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // 静态文件服务（上传文件）
  const uploadPath = resolve(
    process.cwd(),
    configService.get('UPLOAD_PATH', './uploads'),
  );
  app.use('/uploads', express.static(uploadPath));

  // 全局前缀
  const apiPrefix = configService.get('API_PREFIX', 'api');
  app.setGlobalPrefix(apiPrefix);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 全局响应拦截器 - 统一返回格式 { code, message, data }
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS 配置
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Swagger 文档
  const config = new DocumentBuilder()
    .setTitle('OrderFood API')
    .setDescription('OrderFood 点餐系统 API 文档')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = configService.get('PORT', 5000);
  // Listen on all network interfaces (0.0.0.0) to allow access from Android emulator
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server running on http://127.0.0.1:${port}`);
  console.log(`📚 API Docs: http://127.0.0.1:${port}/api-docs`);
}
bootstrap();
