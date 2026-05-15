import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { RedisService } from './redis/redis.service';
import { RedisIoAdapter } from './realtime/redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const apiPrefix = config.get<string>('API_PREFIX') ?? 'api/v1';
  const redis = app.get(RedisService);

  app.setGlobalPrefix(apiPrefix);
  app.useWebSocketAdapter(new RedisIoAdapter(app, redis));
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());
  const isDev = config.get('NODE_ENV') !== 'production';
  app.enableCors({
    origin: isDev
      ? true // Allow all origins in development (Expo, tunnel, LAN, etc.)
      : [
          config.get<string>('WEB_ORIGIN') ?? 'http://localhost:3000',
          config.get<string>('MOBILE_ORIGIN') ?? 'http://localhost:8081',
        ],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('SwasthAI Backend API')
    .setDescription('Production healthcare backend for SwasthAI')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  const port = Number(config.get('PORT') ?? 3001);
  await app.listen(port, '0.0.0.0');
  console.log(`API Gateway is listening on port ${port} (bound to 0.0.0.0)`);
}

bootstrap();
