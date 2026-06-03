import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUserNotifications(
    @Request() req: any,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
  ) {
    return await this.notificationService.getUserNotifications(
      req.user.id,
      skip,
      take,
    );
  }

  @Get('user/unread-count')
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(@Request() req: any) {
    const count = await this.notificationService.getUnreadCount(req.user.id);
    return { unreadCount: count };
  }

  @Get('system')
  async getSystemNotifications(
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 20,
  ) {
    return await this.notificationService.getSystemNotifications(skip, take);
  }

  @Put(':id/read')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('id') id: number) {
    return await this.notificationService.markAsRead(id);
  }

  @Put('mark-all-read')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Request() req: any) {
    await this.notificationService.markAllAsRead(req.user.id);
    return { message: 'All notifications marked as read' };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteNotification(@Param('id') id: number) {
    await this.notificationService.deleteNotification(id);
    return { message: 'Notification deleted' };
  }
}
