import {
  CACHE_MANAGER,
  CacheModule as BaseCacheModule,
  Inject,
  Logger,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import * as redisStore from 'cache-manager-ioredis';
import { Cache } from 'cache-manager';
import { REDISHOST, REDISPORT } from 'src/configuration';
import { IInMemoryServices } from 'src/core/abstracts/in-memory.abstract';
import { RedisService } from './redis-service.service';

@Module({
  imports: [
    BaseCacheModule.registerAsync({
      useFactory: () => {
        return {
          store: redisStore,
          host: REDISHOST,
          port: REDISPORT ,
        }
      },
    }),
  ],
  providers: [
    {
      provide: IInMemoryServices,
      useClass: RedisService,
    },
  ],
  exports: [
    IInMemoryServices,
  ],
})
export class CacheModule implements OnModuleInit {

  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache
  ) { }

  public onModuleInit(): any {
    const logger = new Logger('Cache');

    // Commands that are interesting to log
    const commands = [
      'get',
      'set',
      'del',
    ];
    const cache = this.cache;
    commands.forEach((commandName) => {
      const oldCommand = cache[commandName];
      cache[commandName] = async (...args) => {
        // Computes the duration
        const start = new Date();
        const result = await oldCommand.call(cache, ...args);
        const end = new Date();
        const duration = end.getTime() - start.getTime();

        // Avoid logging the options
        args = args.slice(0, 2);
        logger.log(`${commandName.toUpperCase()} ${args.join(', ')} - ${duration}ms`);

        return result;
      };
    });
  }
}