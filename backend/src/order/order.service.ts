import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from './order.entity';
import { OrderItem } from './order-item.entity';
import { EmailService } from '../email/email.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationType } from '../notification/notification.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
  ) {}

  async findAll(skip: number = 0, take: number = 25, userId?: number): Promise<{ data: Order[]; total: number }> {
    const query = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('order.user', 'user')
      .orderBy('order.createdAt', 'DESC')
      .skip(skip)
      .take(take);

    if (userId) {
      query.where('order.userId = :userId', { userId });
    }

    const [data, total] = await query.getManyAndCount();
    return { data, total };
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product'],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async create(body: { 
    userId?: number; 
    items: { productId: number; quantity: number; price: number }[]; 
    totalAmount: number; 
    shippingAddress: string; 
    paymentMethod: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  }): Promise<Order> {
    const order = this.orderRepository.create({
      ...body,
      paymentStatus: PaymentStatus.PENDING,
      fulfillmentStatus: OrderStatus.PENDING,
    });
    const savedOrder = await this.orderRepository.save(order);
    savedOrder.orderNumber = `ORD-${String(savedOrder.id).padStart(4, '0')}`;
    await this.orderRepository.save(savedOrder);

    for (const item of body.items) {
      const orderItem = this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      });
      await this.orderItemRepository.save(orderItem);
    }

    const fullOrder = await this.findOne(savedOrder.id);

    // Send order confirmation email
    try {
      const orderDetails = {
        items: body.items,
        totalAmount: body.totalAmount,
        shippingAddress: body.shippingAddress,
        customerName: body.customerName,
      };
      await this.emailService.sendOrderConfirmationEmail(
        body.customerEmail,
        body.customerName || 'Valued Customer',
        savedOrder.orderNumber,
        orderDetails
      );
    } catch (error) {
      console.warn('Failed to send order confirmation email:', error);
      // Don't fail the order creation if email fails
    }

    // Create order confirmation notification
    try {
      await this.notificationService.create({
        userId: body.userId,
        type: NotificationType.ORDER_CONFIRMATION,
        title: 'Order Confirmed! 🎉',
        message: `Your order #${savedOrder.orderNumber} has been received. We're processing it now.`,
        relatedOrderId: savedOrder.id,
        icon: '✅',
      });
    } catch (error) {
      console.error('Failed to create order confirmation notification:', error);
    }

    return fullOrder;
  }

  async updateStatus(id: number, fulfillmentStatus: OrderStatus, paymentStatus?: PaymentStatus): Promise<Order> {
    const order = await this.findOne(id);
    const oldStatus = order.fulfillmentStatus;
    
    if (fulfillmentStatus) order.fulfillmentStatus = fulfillmentStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    
    await this.orderRepository.save(order);
    const updatedOrder = await this.findOne(id);

    // Send status update email if status changed
    if (oldStatus !== fulfillmentStatus && order.customerEmail) {
      try {
        await this.emailService.sendOrderStatusEmail(
          order.customerEmail,
          'Valued Customer',
          order.orderNumber,
          fulfillmentStatus,
        );
      } catch (error) {
        console.warn('Failed to send order status email:', error);
        // Don't fail the status update if email fails
      }
    }

    // Create status update notification
    if (oldStatus !== fulfillmentStatus && order.userId) {
      try {
        let notificationType = NotificationType.SYSTEM;
        let title = '';
        let message = '';
        let icon = '';

        switch (fulfillmentStatus) {
          case OrderStatus.SHIPPED:
            notificationType = NotificationType.ORDER_SHIPPED;
            title = 'Order Shipped! 📦';
            message = `Your order #${order.orderNumber} has been shipped. Track your package!`;
            icon = '🚚';
            break;
          case OrderStatus.DELIVERED:
            notificationType = NotificationType.ORDER_DELIVERED;
            title = 'Order Delivered! 📬';
            message = `Your order #${order.orderNumber} has been delivered. Thank you for your purchase!`;
            icon = '✨';
            break;
          case OrderStatus.CANCELLED:
            notificationType = NotificationType.ORDER_CANCELLED;
            title = 'Order Cancelled';
            message = `Your order #${order.orderNumber} has been cancelled.`;
            icon = '❌';
            break;
          case OrderStatus.PENDING:
            title = 'Order Processing';
            message = `Your order #${order.orderNumber} is being processed.`;
            icon = '⏳';
            break;
          default:
            break;
        }

        if (title) {
          await this.notificationService.create({
            userId: order.userId,
            type: notificationType,
            title,
            message,
            relatedOrderId: order.id,
            icon,
          });
        }
      } catch (error) {
        console.error('Failed to create status update notification:', error);
      }
    }

    return updatedOrder;
  }
}
