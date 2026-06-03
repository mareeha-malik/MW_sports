import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { Repository } from 'typeorm';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly cloudinaryService: CloudinaryService, // Dependency injection for Cloudinary
  ) {}

  // Retrieve all products (excluding soft-deleted)
  async findAll(): Promise<Product[]> {
    return await this.productRepository.find({ withDeleted: false });
  }

  // Retrieve a single product by ID (excluding soft-deleted)
  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id }, withDeleted: false });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  // Create a new product
  async create(body, file?: Express.Multer.File): Promise<Product> {
    let uploadedImgUrl = body.img || null;

    if (file) {
      uploadedImgUrl = await this.cloudinaryService.uploadImage(file.path); // Upload file to Cloudinary
    }

    const newProduct = {
      title: body.title,
      description: body.description,
      price: body.price,
      stock: body.stock || 0,
      status: body.status || 'active',
      badge: body.badge || null,
      categoryId: body.categoryId || null,
      oldPrice: body.oldPrice || null,
      rating: body.rating || 0,
      img: uploadedImgUrl,
    };

    return await this.productRepository.save(newProduct); // Save product to the database
  }

  // Update an existing product by ID
  async update(id: number, body, file?: Express.Multer.File): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id }, withDeleted: false });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Handle file upload if a new file is provided
    let updatedImg = product.img;
    if (file) {
      updatedImg = await this.cloudinaryService.uploadImage(file.path);
    } else if (body.img) {
      updatedImg = body.img;
    }

    // Merge updated fields with existing product data
    const updatedProduct = {
      ...product,
      title: body.title || product.title,
      description: body.description || product.description,
      price: body.price !== undefined ? body.price : product.price,
      stock: body.stock !== undefined ? body.stock : product.stock,
      status: body.status || product.status,
      badge: body.badge || product.badge,
      categoryId: body.categoryId !== undefined ? body.categoryId : product.categoryId,
      oldPrice: body.oldPrice !== undefined ? body.oldPrice : product.oldPrice,
      rating: body.rating !== undefined ? body.rating : product.rating,
      img: updatedImg,
    };

    // Perform the update
    await this.productRepository.update(id, updatedProduct);

    // Return the updated product
    return await this.productRepository.findOne({ where: { id }, withDeleted: false });
  }

  // Soft delete a product by ID
  async remove(id: number): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id }, withDeleted: false });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Use soft delete (sets deletedAt timestamp)
    await this.productRepository.softRemove(product);
  }
}
