import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from './category.entity';
import { RolesGuard } from '../roles/roles.guard';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll(): Promise<Category[]> {
    try {
      return await this.categoryService.findAll();
    } catch (error) {
      this.handleError(error, 'Failed to retrieve categories');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Category> {
    try {
      return await this.categoryService.findOne(id);
    } catch (error) {
      this.handleError(error, 'Failed to retrieve category');
    }
  }

  @UseGuards(RolesGuard)
  @Post()
  async create(
    @Body()
    body: {
      name: string;
      slug: string;
      description?: string;
      icon?: string;
      parentId?: number;
    },
  ): Promise<Category> {
    try {
      return await this.categoryService.create(body);
    } catch (error) {
      this.handleError(error, 'Failed to create category');
    }
  }

  @UseGuards(RolesGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<Category>,
  ): Promise<Category> {
    try {
      return await this.categoryService.update(id, body);
    } catch (error) {
      this.handleError(error, 'Failed to update category');
    }
  }

  @UseGuards(RolesGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      await this.categoryService.remove(id);
    } catch (error) {
      this.handleError(error, 'Failed to delete category');
    }
  }

  @UseGuards(RolesGuard)
  @Post('reorder')
  async reorder(
    @Body() body: { categories: { id: number; displayOrder: number }[] },
  ): Promise<void> {
    try {
      await this.categoryService.reorder(body.categories);
    } catch (error) {
      this.handleError(error, 'Failed to reorder categories');
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
