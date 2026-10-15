import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum WalletTransactionType {
  TOPUP = 'TOPUP',
  WITHDRAWAL = 'WITHDRAWAL',
  POT_DEBIT = 'POT_DEBIT',
  POT_CREDIT = 'POT_CREDIT',
}

export enum WalletTransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

/**
 * APPEND-ONLY ledger. No UPDATE or DELETE operations allowed.
 * Liquid wallet balances are computed by SUM.
 */
@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({
    type: 'enum',
    enum: WalletTransactionType,
  })
  type!: WalletTransactionType;

  @Column({ name: 'amount_xaf', type: 'bigint' })
  amountXaf!: string;

  @Column({
    type: 'enum',
    enum: WalletTransactionStatus,
    default: WalletTransactionStatus.PENDING,
  })
  status!: WalletTransactionStatus;

  @Column({ name: 'idempotency_key', type: 'text', unique: true, nullable: true })
  idempotencyKey?: string | null;

  @Column({ name: 'aggregator_ref', type: 'text', nullable: true })
  aggregatorRef?: string | null;

  @Column({ name: 'pot_id', type: 'uuid', nullable: true })
  potId?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
