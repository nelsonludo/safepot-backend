import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  DISBURSED = 'DISBURSED',
  FAILED = 'FAILED',
}

@Entity('withdrawal_requests')
export class WithdrawalRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'amount_xaf', type: 'bigint' })
  amountXaf!: string;

  @Column({ name: 'phone_number', type: 'text' })
  phoneNumber!: string;

  @Column({ name: 'operator_code', type: 'text' })
  operatorCode!: string;

  @Column({
    type: 'enum',
    enum: WithdrawalStatus,
    default: WithdrawalStatus.PENDING,
  })
  status!: WithdrawalStatus;

  @Column({ name: 'idempotency_key', type: 'text', unique: true, nullable: true })
  idempotencyKey?: string | null;

  @Column({ name: 'aggregator_ref', type: 'text', nullable: true })
  aggregatorRef?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt?: Date | null;
}
