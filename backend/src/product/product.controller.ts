import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './product.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from '../roles/roles.guard';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('all')
  async findAll(): Promise<Product[]> {
    return this.productService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Product> {
    return this.productService.findOne(id);
  }
  @Post('create')
  @UseInterceptors(FileInterceptor("image"))
  async create(@Body() body, @UploadedFile() file) {
    console.log(body, file);
    
    // return "product";
    // return body;
    return await this.productService.create(body, file);
  }

  @Put('update/:id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: number,
    @Body() body,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Product> {
    return this.productService.update(id, body, file);
  }

  @Delete('delete/:id')
  async remove(@Param('id') id: number): Promise<void> {
    await this.productService.remove(id);
  }
}
