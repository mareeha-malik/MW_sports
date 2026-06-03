import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, DeleteDateColumn } from 'typeorm';
import { Category } from '../category/category.entity';
import { Review } from '../review/review.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  rating: number;

  @Column()
  price: number;

  @Column({ nullable: true })
  oldPrice: number;

  @Column()
  img: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ default: 'active' })
  status: string;

  @Column({ nullable: true })
  badge: string;

  @ManyToOne(() => Category, (category) => category.products, { eager: true })
  category: Category;

  @Column({ nullable: true })
  categoryId: number;

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date;
}
