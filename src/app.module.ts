import { Module } from "@nestjs/common";
import { JWT_USER_PAYLOAD_TYPE } from "./lib/constants";
import { HomeServices } from "./services/use-cases/home/home.service";
import services from "./services";
import controller from "./controllers";

declare global {
  namespace Express {
    export interface Request {
      user?: JWT_USER_PAYLOAD_TYPE
    }
  }

  var io: any;
}
@Module({
  imports: [...services],
  controllers: [...controller],
  providers: [HomeServices],
})

export class AppModule { }

