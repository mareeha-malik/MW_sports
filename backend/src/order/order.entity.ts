import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { User } from '../user/user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  orderNumber: string;

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @Column({ nullable: true })
  userId: number;

  @OneToMany(() => OrderItem, (item) => item.order, { eager: true })
  items: OrderItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Column({ default: OrderStatus.PENDING })
  fulfillmentStatus: OrderStatus;

  @Column({ nullable: true })
  shippingAddress: string;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column({ nullable: true })
  customerName: string;

  @Column({ nullable: true })
  customerEmail: string;

  @Column({ nullable: true })
  customerPhone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateOrderNumber() {
    if (!this.orderNumber) {
      const timestamp = Date.now().toString();
      const randomSuffix = Math.random().toString(36).slice(2, 8).toUpperCase();
      this.orderNumber = `ORD-${timestamp}-${randomSuffix}`;
    }
  }
}
