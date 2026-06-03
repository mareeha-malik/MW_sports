import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './category.entity';
import { RolesGuard } from '../roles/roles.guard';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Category> {
    return this.categoryService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Post()
  async create(@Body() body: { name: string; slug: string; description?: string; icon?: string; parentId?: number }): Promise<Category> {
    return this.categoryService.create(body);
  }

  @UseGuards(RolesGuard)
  @Put(':id')
  async update(@Param('id') id: number, @Body() body: Partial<Category>): Promise<Category> {
    return this.categoryService.update(id, body);
  }

  @UseGuards(RolesGuard)
  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    await this.categoryService.remove(id);
  }

  @UseGuards(RolesGuard)
  @Post('reorder')
  async reorder(@Body() body: { categories: { id: number; displayOrder: number }[] }): Promise<void> {
    await this.categoryService.reorder(body.categories);
  }
}
