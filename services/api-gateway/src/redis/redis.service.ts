import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  readonly client: Redis;
  readonly publisher: Redis;
  readonly subscriber: Redis;

  constructor(private readonly config: ConfigService) {
    const redisUrl = this.config.getOrThrow<string>('REDIS_URL');
    const common = {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
    };

    this.client = new Redis(redisUrl, common);
    this.publisher = new Redis(redisUrl, common);
    this.subscriber = new Redis(redisUrl, common);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async setJson(key: string, value: unknown, ttlSeconds: number) {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async invalidate(...keys: string[]) {
    if (keys.length) {
      await this.client.del(keys);
    }
  }

  async publish(channel: string, payload: unknown) {
    await this.publisher.publish(channel, JSON.stringify(payload));
  }

  async onModuleDestroy() {
    await Promise.all([
      this.client.quit(),
      this.publisher.quit(),
      this.subscriber.quit(),
    ]);
  }
}
