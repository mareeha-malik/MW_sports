import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order, OrderStatus, PaymentStatus } from './order.entity';
import { RolesGuard } from '../roles/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query('skip') skip: number = 0, @Query('take') take: number = 25, @Req() req: any) {
    const user = req.user;
    // If admin, return all orders; otherwise return only user's orders
    const userId = user.role === 'admin' ? undefined : user.id;
    return this.orderService.findAll(skip, take, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: number, @Req() req: any): Promise<Order> {
    const order = await this.orderService.findOne(id);
    const user = req.user;
    
    // Only allow access if user is admin or the order belongs to them
    if (user.role !== 'admin' && order.userId !== user.id) {
      throw new Error('Unauthorized');
    }
    
    return order;
  }

  @Post()
  async create(@Body() body: { userId?: number; items: { productId: number; quantity: number; price: number }[]; totalAmount: number; shippingAddress: string; paymentMethod: string; customerEmail: string; customerPhone: string }): Promise<Order> {
    return this.orderService.create(body);
  }

  @UseGuards(RolesGuard)
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: number,
    @Body() body: { fulfillmentStatus?: OrderStatus; paymentStatus?: PaymentStatus },
  ): Promise<Order> {
    return this.orderService.updateStatus(id, body.fulfillmentStatus, body.paymentStatus);
  }
}
