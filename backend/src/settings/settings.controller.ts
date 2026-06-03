import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { RolesGuard } from '../roles/roles.guard';
import { Setting } from './settings.entity';

@Controller('admin/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings(): Promise<Setting> {
    try {
      console.log('Fetching settings...');
      const settings = await this.settingsService.getSettings();
      console.log('Settings fetched successfully');
      return settings;
    } catch (error) {
      console.error('Error fetching settings:', error.message);
      throw new BadRequestException('Failed to fetch settings: ' + error.message);
    }
  }

  @Post()
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  async updateSettings(@Body() updateData: Partial<Setting>): Promise<Setting> {
    try {
      return await this.settingsService.updateSettings(updateData);
    } catch (error) {
      throw new BadRequestException('Failed to update settings: ' + error.message);
    }
  }

  @Post('store')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  async updateStoreSettings(
    @Body() data: {
      storeName?: string;
      contactEmail?: string;
      contactPhone?: string;
      whatsappNumber?: string;
      storeAddress?: string;
      storeCity?: string;
      storeCountry?: string;
      taxRate?: number;
      shippingCost?: number;
      currency?: string;
    },
  ): Promise<Setting> {
    try {
      return await this.settingsService.updateStoreSettings(data);
    } catch (error) {
      throw new BadRequestException('Failed to update store settings: ' + error.message);
    }
  }

  @Post('notifications')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  async updateNotificationSettings(
    @Body() data: {
      emailOnOrder?: boolean;
      emailOnReview?: boolean;
      emailOnLowStock?: boolean;
      pushNotifications?: boolean;
      smsNotifications?: boolean;
    },
  ): Promise<Setting> {
    try {
      return await this.settingsService.updateNotificationSettings(data);
    } catch (error) {
      throw new BadRequestException('Failed to update notification settings: ' + error.message);
    }
  }

  @Post('security')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  async updateSecuritySettings(
    @Body() data: {
      twoFactorEnabled?: boolean;
      ipWhitelist?: boolean;
      sessionTimeout?: number;
      passwordExpiry?: number;
    },
  ): Promise<Setting> {
    try {
      return await this.settingsService.updateSecuritySettings(data);
    } catch (error) {
      throw new BadRequestException('Failed to update security settings: ' + error.message);
    }
  }

  @Post('cache/clear')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  async clearCache(): Promise<{ success: boolean; message: string }> {
    try {
      return await this.settingsService.clearCache();
    } catch (error) {
      throw new BadRequestException('Failed to clear cache: ' + error.message);
    }
  }

  @Post('database/optimize')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.OK)
  async optimizeDatabase(): Promise<{ success: boolean; message: string }> {
    try {
      return await this.settingsService.optimizeDatabase();
    } catch (error) {
      throw new BadRequestException('Failed to optimize database: ' + error.message);
    }
  }
}
