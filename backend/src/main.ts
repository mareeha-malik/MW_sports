import { ValidationPipe, HttpException, HttpStatus } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const frontendOrigin = process.env.FRONTEND_URL || 'https://mw-sports.vercel.app';

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.toLowerCase();
      const allowedOrigins = [frontendOrigin.toLowerCase()];

      if (
        allowedOrigins.includes(normalizedOrigin) ||
        (!isProduction && (normalizedOrigin.startsWith('http://localhost') || normalizedOrigin.startsWith('http://127.0.0.1')))
      ) {
        return callback(null, true);
      }

      return callback(new HttpException('CORS policy: origin not allowed', HttpStatus.FORBIDDEN), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'User-Agent', 'Access-Control-Allow-Origin'],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }));
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = parseInt(process.env.PORT, 10) || 8000;
  await app.listen(port);
  console.log(`Backend is running on port ${port}`);
}

bootstrap().catch((error) => {
  console.error('Application bootstrap failed', error);
  process.exit(1);
});
