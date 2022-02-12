import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controllers';
import { AuthenticationController } from './controllers/authentication/index.controller';
import { RedisServiceModule } from './frameworks/in-memory-database/redis/redis-service.module';
import { DiscordServicesModule } from './frameworks/notification-services/discord/discord-service.module';
import { JWT_USER_PAYLOAD_TYPE } from './lib/constants';
import { DataServicesModule } from './services/data-services/data-services.module';
import { UserServicesModule } from './services/use-cases/user/user-service.module';


declare global {
  namespace Express {


    export interface Request {
      user?: JWT_USER_PAYLOAD_TYPE;
    }
  }

  var io: any;
}
@Module({
  imports: [
    DataServicesModule,
    UserServicesModule,
    DiscordServicesModule,
    RedisServiceModule
  ],
  controllers: [
    AppController,
    AuthenticationController
  ],
  providers: [],
})
export class AppModule { }


// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(LoggingMiddleware).forRoutes("/")
//   }
// }