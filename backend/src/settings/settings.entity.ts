import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', default: 'MW Sports' })
  storeName: string;

  @Column({ type: 'varchar', default: 'contact@mwsports.com' })
  contactEmail: string;

  @Column({ type: 'varchar', default: '+92 123 456 7890' })
  contactPhone: string;

  @Column({ type: 'varchar', default: '+92 123 456 7890' })
  whatsappNumber: string;

  @Column({ type: 'varchar', default: '123 Sports Lane' })
  storeAddress: string;

  @Column({ type: 'varchar', default: 'Karachi' })
  storeCity: string;

  @Column({ type: 'varchar', default: 'Pakistan' })
  storeCountry: string;

  @Column({ type: 'float', default: 17 })
  taxRate: number;

  @Column({ type: 'float', default: 200 })
  shippingCost: number;

  @Column({ type: 'varchar', default: 'PKR' })
  currency: string;

  // Notification Settings
  @Column({ type: 'boolean', default: true })
  emailOnOrder: boolean;

  @Column({ type: 'boolean', default: true })
  emailOnReview: boolean;

  @Column({ type: 'boolean', default: true })
  emailOnLowStock: boolean;

  @Column({ type: 'boolean', default: true })
  pushNotifications: boolean;

  @Column({ type: 'boolean', default: false })
  smsNotifications: boolean;

  // Security Settings
  @Column({ type: 'boolean', default: false })
  twoFactorEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  ipWhitelist: boolean;

  @Column({ type: 'int', default: 30 })
  sessionTimeout: number;

  @Column({ type: 'int', default: 90 })
  passwordExpiry: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
