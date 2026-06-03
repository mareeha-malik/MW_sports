import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Allow all localhost origins in development
  app.enableCors({
    origin: (origin, callback) => {
      // Allow all localhost variations in development
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        callback(null, true);
      } else if (process.env.NODE_ENV === 'production') {
        const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
        if (origin === allowedOrigin) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  });
  
  await app.listen(8000);
}
bootstrap();
