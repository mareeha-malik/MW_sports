import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  HttpException,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './product.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from '../roles/roles.guard';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('all')
  async findAll(): Promise<Product[]> {
    try {
      return await this.productService.findAll();
    } catch (error) {
      this.handleError(error, 'Failed to retrieve products');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    try {
      return await this.productService.findOne(id);
    } catch (error) {
      this.handleError(error, 'Failed to retrieve product');
    }
  }

  @Post('create')
  @UseInterceptors(FileInterceptor('image'))
  async create(@Body() body, @UploadedFile() file?: Express.Multer.File) {
    try {
      return await this.productService.create(body, file);
    } catch (error) {
      this.handleError(error, 'Failed to create product');
    }
  }

  @Put('update/:id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Product> {
    try {
      return await this.productService.update(id, body, file);
    } catch (error) {
      this.handleError(error, 'Failed to update product');
    }
  }

  @Delete('delete/:id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      await this.productService.remove(id);
    } catch (error) {
      this.handleError(error, 'Failed to delete product');
    }
  }

  private handleError(error: unknown, fallback: string): never {
    if (error instanceof HttpException) {
      throw error;
    }
    console.error(fallback, error);
    throw new HttpException(fallback, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
