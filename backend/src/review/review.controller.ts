import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ReviewService } from './review.service';
import { Review, ReviewStatus } from './review.entity';
import { RolesGuard } from '../roles/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any, @Body() body: { productId: number; rating: number; comment: string }): Promise<Review> {
    const userId = req.user.id;
    return this.reviewService.create(userId, body.productId, body.rating, body.comment);
  }

  @Get()
  async findAll(@Query('skip') skip: number = 0, @Query('take') take: number = 25, @Query('productId') productId?: number) {
    if (productId) {
      const reviews = await this.reviewService.findByProductId(productId);
      return { data: reviews, total: reviews.length };
    }
    return this.reviewService.findAll(skip, take);
  }

  @UseGuards(RolesGuard)
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Review> {
    return this.reviewService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Put(':id/status')
  async updateStatus(@Param('id') id: number, @Body() body: { status: ReviewStatus }): Promise<Review> {
    return this.reviewService.updateStatus(id, body.status);
  }

  @UseGuards(RolesGuard)
  @Put(':id/flag')
  async flag(@Param('id') id: number): Promise<Review> {
    return this.reviewService.flag(id);
  }

  @UseGuards(RolesGuard)
  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.reviewService.delete(id);
  }
}
