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
@Module({
  imports: [
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..','uploads'),  
    //   serveRoot: '/uploads', 
    // }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      host: process.env.DATABASE_URL
        ? undefined
        : process.env.DB_HOST || 'ep-sweet-sea-a16w6jvz.ap-southeast-1.aws.neon.tech',
      port: process.env.DATABASE_URL ? undefined : parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DATABASE_URL ? undefined : process.env.DB_USERNAME || 'MW-Sports_owner',
      password: process.env.DATABASE_URL ? undefined : process.env.DB_PASSWORD || 'oFXd1wu5cbla',
      database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME || 'MW-Sports',
      autoLoadEntities: true,
      synchronize: !isProduction,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
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