import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './product/product.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { CategoryModule } from './category/category.module';
import { OrderModule } from './order/order.module';
import { ReviewModule } from './review/review.module';
import { SettingsModule } from './settings/settings.module';
import { EmailModule } from './email/email.module';
import { NotificationModule } from './notification/notification.module';
import * as dotenv from 'dotenv';
dotenv.config();
const isProduction = process.env.NODE_ENV === 'production';
const parsedDatabaseUrl = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : undefined;
const databaseHost = process.env.DB_HOST || 'ep-sweet-sea-a16w6jvz.ap-southeast-1.aws.neon.tech';
const useDatabaseUrl = isProduction || process.env.DB_USE_URL === 'true';
const useSsl = process.env.DB_SSL === 'true' || databaseHost !== 'localhost' && databaseHost !== '127.0.0.1' || useDatabaseUrl;
const databaseUsername = process.env.DB_USERNAME || parsedDatabaseUrl?.username || 'MW-Sports_owner';
const databasePassword = process.env.DB_PASSWORD || parsedDatabaseUrl?.password || 'oFXd1wu5cbla';
const databaseName = process.env.DB_NAME || parsedDatabaseUrl?.pathname.replace(/^\//, '') || 'MW-Sports';
@Module({
  imports: [
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..','uploads'),  
    //   serveRoot: '/uploads', 
    // }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: useDatabaseUrl ? process.env.DATABASE_URL : undefined,
      host: useDatabaseUrl ? undefined : databaseHost,
      port: useDatabaseUrl ? undefined : parseInt(process.env.DB_PORT, 10) || 5432,
      username: useDatabaseUrl ? undefined : databaseUsername,
      password: useDatabaseUrl ? undefined : databasePassword,
      database: useDatabaseUrl ? undefined : databaseName,
      autoLoadEntities: true,
      synchronize: !isProduction,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      retryAttempts: 3,
      retryDelay: 2000,
      logging: ['error'],
    }),
    TypeOrmModule.forFeature([]),
    ProductModule,
    CloudinaryModule,
    UserModule,
    AuthModule,
    CartModule,
    CategoryModule,
    OrderModule,
    ReviewModule,
    SettingsModule,
    EmailModule,
    NotificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}