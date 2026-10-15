import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../entities/user.entity';
import { WalletTransaction } from '../entities/wallet-transaction.entity';
import { SavingsPot } from '../entities/savings-pot.entity';
import { PotTransaction } from '../entities/pot-transaction.entity';
import { WithdrawalRequest } from '../entities/withdrawal-request.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [User, WalletTransaction, SavingsPot, PotTransaction, WithdrawalRequest],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  subscribers: [],
});
