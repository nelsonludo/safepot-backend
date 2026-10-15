import { Provider } from '@nestjs/common';
import Redis from 'ioredis';

export const IOREDIS_CLIENT = 'IOREDIS_CLIENT';

export const redisProvider: Provider = {
  provide: IOREDIS_CLIENT,
  useFactory: () => {
    const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    client.on('error', (err: Error) => {
      console.error('[Redis] client error:', err.message);
    });

    return client;
  },
};
