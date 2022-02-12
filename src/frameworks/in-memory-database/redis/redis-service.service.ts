import { CACHE_MANAGER, Inject, Injectable, Logger } from "@nestjs/common";
import { IInMemoryServices } from "src/core/abstracts/in-memory.abstract";


@Injectable()
export class RedisService implements IInMemoryServices {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: IInMemoryServices,
  ) { }

  async set(key: string, value: any, expiry: number) {
    try {
      await this.cache.set(key, value, expiry);

    } catch (e) {
      Logger.error('@cache-manager-redis', e)
    }

  }
  async get(key: string) {
    try {
      const value = await this.cache.get(key)
      return value;
    } catch (e) {
      Logger.error('@cache-manager-redis', e)
    }
  }

  async del(key: string) {
    try {
      await this.cache.del(key);

    } catch (e) {
      Logger.error('@cache-manager-redis', e)
    }
  }

}

