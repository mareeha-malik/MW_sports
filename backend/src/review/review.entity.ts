import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Product } from '../product/product.entity';

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('review')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Product, (product) => product.reviews)
  product: Product;

  @Column()
  productId: number;

  @Column()
  rating: number;

  @Column()
  comment: string;

  @Column({ default: ReviewStatus.PENDING })
  status: ReviewStatus;

  @Column({ default: false })
  isFlagged: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
