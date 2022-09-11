import { MiddlewareConsumer, Module } from "@nestjs/common";
import { USER_LOCK, USER_SIGNUP_STATUS_TYPE } from "./lib/constants";
import { HomeServices } from "./services/use-cases/home/home.service";
import services from "./services";
import controller from "./controllers";
import LogsMiddleware from "./middleware-guards/logs.middleware";
import { APP_GUARD } from "@nestjs/core";
import { PermissionGuard } from "./middleware-guards/permission-guard.middleware";
import { RoleType } from "./core/types/roles";

declare global {
  namespace Express {
    export interface Request {
      user?: {
        _id?: string ;
        fullName?: string;
        email?: string;
        authStatus?: USER_SIGNUP_STATUS_TYPE;
        lock?: USER_LOCK;
        emailVerified?: boolean;
        phoneVerified?: boolean;
        roles?: RoleType[]
      }
    }
  }

  var io: any;
}
@Module({
  imports: [...services],
  controllers: [...controller],
  providers: [
    HomeServices,
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})

export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogsMiddleware).forRoutes('*');
  }
}

