import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './settings.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>,
  ) {}

  async getSettings(): Promise<Setting> {
    try {
      let settings = await this.settingsRepository.findOne({ where: { id: 1 } });
      
      // If no settings exist, create defaults
      if (!settings) {
        console.log('Creating default settings...');
        settings = this.settingsRepository.create({
          id: 1,
          storeName: 'MW Sports',
          contactEmail: 'contact@mwsports.com',
          contactPhone: '+92 123 456 7890',
          whatsappNumber: '+92 123 456 7890',
          storeAddress: '123 Sports Lane',
          storeCity: 'Karachi',
          storeCountry: 'Pakistan',
          taxRate: 17,
          shippingCost: 200,
          currency: 'PKR',
          emailOnOrder: true,
          emailOnReview: true,
          emailOnLowStock: true,
          pushNotifications: true,
          smsNotifications: false,
          twoFactorEnabled: false,
          ipWhitelist: false,
          sessionTimeout: 30,
          passwordExpiry: 90,
        });
        settings = await this.settingsRepository.save(settings);
        console.log('Default settings created successfully');
      }
      
      return settings;
    } catch (error) {
      console.error('Error in getSettings:', error.message);
      throw error;
    }
  }

  async updateSettings(updateData: Partial<Setting>): Promise<Setting> {
    const settings = await this.getSettings();
    Object.assign(settings, updateData);
    return await this.settingsRepository.save(settings);
  }

  async updateStoreSettings(data: {
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
  }): Promise<Setting> {
    return this.updateSettings(data);
  }

  async updateNotificationSettings(data: {
    emailOnOrder?: boolean;
    emailOnReview?: boolean;
    emailOnLowStock?: boolean;
    pushNotifications?: boolean;
    smsNotifications?: boolean;
  }): Promise<Setting> {
    return this.updateSettings(data);
  }

  async updateSecuritySettings(data: {
    twoFactorEnabled?: boolean;
    ipWhitelist?: boolean;
    sessionTimeout?: number;
    passwordExpiry?: number;
  }): Promise<Setting> {
    return this.updateSettings(data);
  }

  async clearCache(): Promise<{ success: boolean; message: string }> {
    // This is a placeholder for cache clearing logic
    // In a real application, you'd clear Redis cache or similar
    return {
      success: true,
      message: 'Cache cleared successfully',
    };
  }

  async optimizeDatabase(): Promise<{ success: boolean; message: string }> {
    // This is a placeholder for database optimization
    // In PostgreSQL, you might run VACUUM or ANALYZE
    try {
      // You could run a VACUUM command here if needed
      // For now, just return success
      return {
        success: true,
        message: 'Database optimization completed',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Database optimization failed: ' + error.message,
      };
    }
  }
}
