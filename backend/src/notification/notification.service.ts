import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(data: {
    userId?: number;
    type: NotificationType;
    title: string;
    message: string;
    relatedOrderId?: number;
    relatedProductId?: number;
    icon?: string;
  }): Promise<Notification> {
    const notification = this.notificationRepository.create(data);
    return await this.notificationRepository.save(notification);
  }

  async getUserNotifications(
    userId: number,
    skip: number = 0,
    take: number = 20,
  ): Promise<{ data: Notification[]; total: number; unreadCount: number }> {
    const [data, total] = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip,
      take,
    });

    const unreadCount = await this.notificationRepository.count({
      where: { userId, isRead: false },
    });

    return { data, total, unreadCount };
  }

  async getSystemNotifications(
    skip: number = 0,
    take: number = 20,
  ): Promise<{ data: Notification[]; total: number }> {
    const [data, total] = await this.notificationRepository.findAndCount({
      where: { userId: null },
      order: { createdAt: 'DESC' },
      skip,
      take,
    });

    return { data, total };
  }

  async markAsRead(notificationId: number): Promise<Notification> {
    await this.notificationRepository.update(notificationId, { isRead: true });
    return await this.notificationRepository.findOne({
      where: { id: notificationId },
    });
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  async deleteNotification(notificationId: number): Promise<void> {
    await this.notificationRepository.delete(notificationId);
  }

  async deleteOldNotifications(daysOld: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    await this.notificationRepository.delete({
      createdAt: LessThan(cutoffDate),
    });
  }

  async getUnreadCount(userId: number): Promise<number> {
    return await this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }
}
