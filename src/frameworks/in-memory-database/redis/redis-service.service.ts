import { Injectable, Logger } from "@nestjs/common";
import { IInMemoryServices } from "src/core/abstracts/in-memory.abstract";

import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { env } from "src/configuration";

@Injectable()
export class CustomRedisService implements IInMemoryServices {


  constructor(
    @InjectRedis() private readonly redis: Redis,
  ) { }

  async set(key: string, value: any, expiry: string | number) {
    try {
      await this.redis.set(`${env.env}-${key}`, `${value}`, 'EX', expiry);
    } catch (e) {
      Logger.error('@cache-manager-redis', e)
    }

  }
  async get(key: string) {
    try {
      const value = await this.redis.get(`${env.env}-${key}`)
      return value;
    } catch (e) {
      Logger.error('@cache-manager-redis', e)
    }
  }

  async del(key: string) {
    try {
      await this.redis.del(`${env.env}-${key}`);
    } catch (e) {
      Logger.error('@cache-manager-redis', e)
    }
  }

  async ttl(key: string) {
    try {
      const value = await this.redis.ttl(`${env.env}-${key}`);
      return value;

    } catch (e) {
      Logger.error('@cache-manager-redis', e)
    }
  }
}

