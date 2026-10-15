import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheckService, TypeOrmHealthIndicator, HealthCheck } from '@nestjs/terminus';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import Redis from 'ioredis';
import { IOREDIS_CLIENT } from '../redis/redis.provider';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(IOREDIS_CLIENT) private readonly redis: Redis,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    const timestamp = new Date().toISOString();

    let postgresOk = true;
    let redisOk = true;
    const errors: Record<string, string> = {};

    try {
      await this.db.pingCheck('postgres', { connection: this.dataSource });
    } catch (err) {
      postgresOk = false;
      errors['postgres'] = err instanceof Error ? err.message : 'unreachable';
    }

    try {
      const pong = await this.redis.ping();
      if (pong !== 'PONG') throw new Error('unexpected response');
    } catch (err) {
      redisOk = false;
      errors['redis'] = err instanceof Error ? err.message : 'unreachable';
    }

    const response = {
      postgres: postgresOk ? 'ok' : errors['postgres'],
      redis: redisOk ? 'ok' : errors['redis'],
      timestamp,
    };

    if (!postgresOk || !redisOk) {
      // Return 503 by throwing; caller catches and returns 503
      const { HttpException, HttpStatus } = await import('@nestjs/common');
      throw new HttpException(response, HttpStatus.SERVICE_UNAVAILABLE);
    }

    return response;
  }
}
