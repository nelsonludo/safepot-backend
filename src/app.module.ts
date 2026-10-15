import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AppDataSource } from './database/data-source';
import { User, WalletTransaction, SavingsPot, PotTransaction, WithdrawalRequest } from './entities';
import { RlsMiddleware } from './database/rls.middleware';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    // Database
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...AppDataSource.options,
        autoLoadEntities: true,
      }),
    }),
    TypeOrmModule.forFeature([
      User,
      WalletTransaction,
      SavingsPot,
      PotTransaction,
      WithdrawalRequest,
    ]),

    // Redis / BullMQ
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: process.env.REDIS_URL ?? 'redis://localhost:6379',
      }),
    }),
    BullModule.registerQueue(
      { name: 'notifications' },
      { name: 'reconciliation' },
      { name: 'pot-lifecycle' },
    ),

    // Feature modules
    RedisModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RlsMiddleware).forRoutes('*');
  }
}
