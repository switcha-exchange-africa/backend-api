import { AxiosServiceModule } from './frameworks/in-memory-database/axios/axios-service.module';
import { HttpModule } from '@nestjs/axios';
import { Module} from '@nestjs/common';
import { AccountController } from './controllers/account/index.controller';
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
    AxiosServiceModule,
    DataServicesModule,
    UserServicesModule,
    DiscordServicesModule,
    RedisServiceModule
  ],
  controllers: [
    AppController,
    AuthenticationController,
    AccountController
  ],
  providers: [],
})
export class AppModule { }


// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer.apply(LoggingMiddleware).forRoutes("/")
//   }
// }