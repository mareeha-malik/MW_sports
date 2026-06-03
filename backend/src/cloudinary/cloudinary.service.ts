import { Injectable, BadRequestException } from '@nestjs/common';
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from 'cloudinary';
const fs = require('fs');

@Injectable()
export class CloudinaryService {
  async uploadImage(file: any) {
    if (!file || !file.path) {
      throw new BadRequestException('File not found or invalid');
    }

    try {
      console.log('Uploading file to Cloudinary:', file.path);
      const response = await cloudinary.uploader.upload(file.path, {
        resource_type: 'auto',
      });

      console.log('File uploaded on cloudinary', response);

      // Clean up temp file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return response.url;
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      
      // Clean up temp file on error
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      throw new BadRequestException('Failed to upload image to Cloudinary');
    }
  }
}
