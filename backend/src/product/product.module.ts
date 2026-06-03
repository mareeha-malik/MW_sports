import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { MulterModule } from '@nestjs/platform-express';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { uploadStorage } from 'src/constants';
import { AuthModule } from 'src/auth/auth.module';
// import { uploadStorage } from 'src/constants';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
      storage: uploadStorage,
    }),
    TypeOrmModule.forFeature([Product]),
    CloudinaryModule,
    AuthModule,
  ],

  providers: [ProductService],
  controllers: [ProductController],
})
export class ProductModule {}
