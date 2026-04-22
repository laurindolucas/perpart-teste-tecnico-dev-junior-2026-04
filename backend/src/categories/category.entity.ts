import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, ManyToMany, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Product } from '../products/product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User, (user) => user.categories, { onDelete: 'SET NULL', nullable: true })
  owner: User;

  @ManyToMany(() => Product, (product) => product.categories)
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}