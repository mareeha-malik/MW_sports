import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Req() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('add')
  async addItem(
    @Req() req: any,
    @Body() body: { productId: number; quantity?: number },
  ) {
    return this.cartService.addItem(req.user.id, body.productId, body.quantity || 1);
  }

  @Put('item/:id')
  async updateItem(
    @Req() req: any,
    @Param('id') id: number,
    @Body() body: { quantity: number },
  ) {
    return this.cartService.updateItem(req.user.id, id, body.quantity);
  }

  @Delete('item/:id')
  async removeItem(@Req() req: any, @Param('id') id: number) {
    await this.cartService.removeItem(req.user.id, id);
    return { message: 'Item removed' };
  }

  @Delete()
  async clearCart(@Req() req: any) {
    await this.cartService.clearCart(req.user.id);
    return { message: 'Cart cleared' };
  }

  @Post('merge')
  async mergeItems(
    @Req() req: any,
    @Body() body: { items: { productId: number; quantity: number }[] },
  ) {
    return this.cartService.mergeItems(req.user.id, body.items || []);
  }
}
