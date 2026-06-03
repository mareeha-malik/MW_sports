import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart.entity';
import { Product } from '../product/product.entity';
import { User } from '../user/user.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getCart(userId: number): Promise<CartItem[]> {
    return this.cartRepository.find({ where: { user: { id: userId } } });
  }

  async addItem(userId: number, productId: number, quantity: number): Promise<CartItem> {
    const normalizedQty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const product = await this.productRepository.findOne({ where: { id: productId }, withDeleted: false });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.cartRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });

    if (existing) {
      existing.quantity += normalizedQty;
      return this.cartRepository.save(existing);
    }

    const item = this.cartRepository.create({ user, product, quantity: normalizedQty });
    return this.cartRepository.save(item);
  }

  async updateItem(userId: number, itemId: number, quantity: number): Promise<CartItem> {
    const normalizedQty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
    const item = await this.cartRepository.findOne({
      where: { id: itemId, user: { id: userId } },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    item.quantity = normalizedQty;
    return this.cartRepository.save(item);
  }

  async removeItem(userId: number, itemId: number): Promise<void> {
    const item = await this.cartRepository.findOne({
      where: { id: itemId, user: { id: userId } },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartRepository.remove(item);
  }

  async mergeItems(userId: number, items: { productId: number; quantity: number }[]): Promise<CartItem[]> {
    const merged: CartItem[] = [];
    for (const item of items) {
      const quantity = item.quantity || 1;
      const saved = await this.addItem(userId, item.productId, quantity);
      merged.push(saved);
    }
    return this.getCart(userId);
  }

  async clearCart(userId: number): Promise<void> {
    await this.cartRepository.delete({ user: { id: userId } });
  }
}
