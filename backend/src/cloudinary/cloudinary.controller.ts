import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';

@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      console.log('Received file:', {
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
      });
      
      const imageUrl = await this.cloudinaryService.uploadImage(file);
      return { url: imageUrl };
    } catch (error) {
      console.error('Upload controller error:', error);
      throw error;
    }
  }
}
