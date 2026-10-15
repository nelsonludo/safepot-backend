import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum SavingsPotStatus {
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  UNLOCKED = 'UNLOCKED',
  CLOSED = 'CLOSED',
}

@Entity('savings_pots')
export class SavingsPot {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'text', nullable: false })
  name!: string;

  @Column({ name: 'target_amount_xaf', type: 'bigint', nullable: true })
  targetAmountXaf?: string | null;

  @Column({
    type: 'enum',
    enum: SavingsPotStatus,
    default: SavingsPotStatus.ACTIVE,
  })
  status!: SavingsPotStatus;

  @Column({ name: 'lock_until', type: 'timestamptz' })
  lockUntil!: Date;

  @Column({ name: 'early_exit_penalty_pct', type: 'smallint', default: 5 })
  earlyExitPenaltyPct!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
