import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { Setting } from './settings.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Setting]), AuthModule],
  providers: [SettingsService],
  controllers: [SettingsController],
  exports: [SettingsService],
})
export class SettingsModule implements OnModuleInit {
  constructor(private settingsService: SettingsService) {}

  async onModuleInit() {
    try {
      console.log('Initializing settings on module startup...');
      // Ensure default settings exist
      await this.settingsService.getSettings();
      console.log('Settings module initialized successfully');
    } catch (error) {
      console.error('Error initializing settings module:', error.message);
    }
  }
}
