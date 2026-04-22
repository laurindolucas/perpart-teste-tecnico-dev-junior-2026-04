import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  user: User;

  @Column()
  action: string;

  @Column()
  entity: string;
  @Column({ nullable: true })
  entityId: string;

  @Column({ type: 'jsonb', nullable: true })
  details: object;

  @CreateDateColumn()
  createdAt: Date;
}