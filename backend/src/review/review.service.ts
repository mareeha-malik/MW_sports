import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewStatus } from './review.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async findAll(skip: number = 0, take: number = 25): Promise<{ data: Review[]; total: number }> {
    const [data, total] = await this.reviewRepository.findAndCount({
      skip,
      take,
      relations: ['user', 'product'],
      order: { createdAt: 'DESC' },
    });
    return { data, total };
  }

  async findByProductId(productId: number): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: { productId },
      relations: ['user', 'product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }

  async updateStatus(id: number, status: ReviewStatus): Promise<Review> {
    const review = await this.findOne(id);
    review.status = status;
    await this.reviewRepository.save(review);
    return review;
  }

  async flag(id: number): Promise<Review> {
    const review = await this.findOne(id);
    review.isFlagged = !review.isFlagged;
    await this.reviewRepository.save(review);
    return review;
  }

  async delete(id: number): Promise<void> {
    const review = await this.findOne(id);
    await this.reviewRepository.remove(review);
  }

  async create(userId: number, productId: number, rating: number, comment: string): Promise<Review> {
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      throw new Error('Rating must be between 1 and 5');
    }
    if (!comment || comment.trim().length === 0) {
      throw new Error('Comment is required');
    }
    
    const review = this.reviewRepository.create({
      userId,
      productId,
      rating,
      comment,
      status: ReviewStatus.PENDING,
    });
    
    return await this.reviewRepository.save(review);
  }
}
