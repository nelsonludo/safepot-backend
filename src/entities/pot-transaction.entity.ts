import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SavingsPot } from './savings-pot.entity';

export enum PotTransactionType {
  DEPOSIT = 'DEPOSIT',
  UNLOCK_RETURN = 'UNLOCK_RETURN',
  PENALTY = 'PENALTY',
}

export enum PotTransactionStatus {
  CONFIRMED = 'CONFIRMED',
  PENDING = 'PENDING',
}

/**
 * APPEND-ONLY ledger. No UPDATE or DELETE operations allowed.
 * Per-pot locked balances are computed by SUM.
 */
@Entity('pot_transactions')
export class PotTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'pot_id', type: 'uuid' })
  potId!: string;

  @ManyToOne(() => SavingsPot)
  @JoinColumn({ name: 'pot_id' })
  pot!: SavingsPot;

  @Column({
    type: 'enum',
    enum: PotTransactionType,
  })
  type!: PotTransactionType;

  @Column({ name: 'amount_xaf', type: 'bigint' })
  amountXaf!: string;

  @Column({
    type: 'enum',
    enum: PotTransactionStatus,
    default: PotTransactionStatus.CONFIRMED,
  })
  status!: PotTransactionStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
