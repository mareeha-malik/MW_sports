import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({ order: { displayOrder: 'ASC', name: 'ASC' } });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async create(body: { name: string; slug: string; description?: string; icon?: string; parentId?: number }): Promise<Category> {
    const category = this.categoryRepository.create(body);
    return this.categoryRepository.save(category);
  }

  async update(id: number, body: Partial<Category>): Promise<Category> {
    const category = await this.findOne(id);
    Object.assign(category, body);
    return this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }

  async reorder(categories: { id: number; displayOrder: number }[]): Promise<void> {
    for (const cat of categories) {
      await this.categoryRepository.update(cat.id, { displayOrder: cat.displayOrder });
    }
  }
}
