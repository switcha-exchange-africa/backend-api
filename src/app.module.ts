import { MiddlewareConsumer, Module } from "@nestjs/common";
import { HomeServices } from "./services/use-cases/home/home.service";
import services from "./services";
import controller from "./controllers";
import LogsMiddleware from "./middleware-guards/logs.middleware";
import { APP_GUARD } from "@nestjs/core";
import { PermissionGuard } from "./middleware-guards/permission-guard.middleware";
import { RoleType } from "./core/types/roles";
import { AdminAuthGuard, AuthGuard, BypassGuard, IsLevelThreeGuard, IsLevelTwoGuard } from "./middleware-guards/auth-guard.middleware";
import { FeatureManagementGuard } from "./middleware-guards/misc.middleware";
import CustomIpMiddleware from "./middleware-guards/custom-ip.middleware";
declare global {
  namespace Express {
    export interface Request {
      user?: {
        _id?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        lock?: boolean;
        isBlacklisted: boolean;
        level?: string;
        username?: string
        emailVerified?: boolean;
        phoneVerified?: boolean;
        roles?: RoleType[]
      }
    }
  }

  var io: any;
}
@Module({
  imports: [
    ...services,
  ],
  controllers: [...controller],
  providers: [
    HomeServices,
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: BypassGuard,
    },
    {
      provide: APP_GUARD,
      useClass: FeatureManagementGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AdminAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: IsLevelThreeGuard,
    },
    {
      provide: APP_GUARD,
      useClass: IsLevelTwoGuard,
    },

    

  ],
})

export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CustomIpMiddleware).forRoutes('*');    
    consumer.apply(LogsMiddleware).forRoutes('*');

  }
}


