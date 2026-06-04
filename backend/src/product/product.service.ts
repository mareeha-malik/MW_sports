import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(): Promise<Product[]> {
    try {
      return await this.productRepository.find({ withDeleted: false });
    } catch (error) {
      console.error('Product findAll failed', error);
      throw new InternalServerErrorException('Unable to retrieve products');
    }
  }

  async findOne(id: number): Promise<Product> {
    try {
      const product = await this.productRepository.findOne({ where: { id }, withDeleted: false });
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      return product;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Product findOne failed', error);
      throw new InternalServerErrorException('Unable to retrieve product');
    }
  }

  async create(body, file?: Express.Multer.File): Promise<Product> {
    try {
      let uploadedImgUrl = body.img || null;

      if (file) {
        uploadedImgUrl = await this.cloudinaryService.uploadImage(file.path);
      }

      const newProduct = {
        title: body.title,
        description: body.description,
        price: body.price !== undefined ? Number(body.price) : null,
        stock: body.stock !== undefined ? Number(body.stock) : 0,
        status: body.status || 'active',
        badge: body.badge || null,
        categoryId: body.categoryId !== undefined ? Number(body.categoryId) : null,
        oldPrice: body.oldPrice !== undefined ? Number(body.oldPrice) : null,
        rating: body.rating !== undefined ? Number(body.rating) : 0,
        img: uploadedImgUrl,
      };

      return await this.productRepository.save(newProduct);
    } catch (error) {
      console.error('Product create failed', error);
      throw new InternalServerErrorException('Unable to create product');
    }
  }

  async update(id: number, body, file?: Express.Multer.File): Promise<Product> {
    try {
      const product = await this.productRepository.findOne({ where: { id }, withDeleted: false });
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      let updatedImg = product.img;
      if (file) {
        updatedImg = await this.cloudinaryService.uploadImage(file.path);
      } else if (body.img) {
        updatedImg = body.img;
      }

      const updatedProduct = {
        ...product,
        title: body.title ?? product.title,
        description: body.description ?? product.description,
        price: body.price !== undefined ? Number(body.price) : product.price,
        stock: body.stock !== undefined ? Number(body.stock) : product.stock,
        status: body.status ?? product.status,
        badge: body.badge ?? product.badge,
        categoryId: body.categoryId !== undefined ? Number(body.categoryId) : product.categoryId,
        oldPrice: body.oldPrice !== undefined ? Number(body.oldPrice) : product.oldPrice,
        rating: body.rating !== undefined ? Number(body.rating) : product.rating,
        img: updatedImg,
      };

      await this.productRepository.update(id, updatedProduct);
      const updated = await this.productRepository.findOne({ where: { id }, withDeleted: false });
      if (!updated) {
        throw new InternalServerErrorException('Updated product could not be loaded');
      }
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Product update failed', error);
      throw new InternalServerErrorException('Unable to update product');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const product = await this.productRepository.findOne({ where: { id }, withDeleted: false });
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      await this.productRepository.softRemove(product);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Product remove failed', error);
      throw new InternalServerErrorException('Unable to delete product');
    }
  }
}
