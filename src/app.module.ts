import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './controllers/app.controllers';
import { AuthenticationController } from './controllers/authentication/index.controller';
import { DiscordServicesModule } from './frameworks/notification-services/discord/discord-service.module';
import { DataServicesModule } from './services/data-services/data-services.module';
import { UserServicesModule } from './services/use-cases/user/user-service.module';



@Module({
  imports: [
    DataServicesModule,
    UserServicesModule,
    DiscordServicesModule,
    CacheModule
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