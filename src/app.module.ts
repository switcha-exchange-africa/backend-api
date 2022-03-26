import { Module } from "@nestjs/common";
import controllers from "./controllers";
import { JWT_USER_PAYLOAD_TYPE } from "./lib/constants";
import modules from './modules';
import { HomeServices } from "./services/use-cases/home/home.service";

declare global {
  namespace Express {
    export interface Request {
      user?: JWT_USER_PAYLOAD_TYPE
    }
  }

  var io: any;
}
@Module({
  imports: [...modules],
  controllers: [...controllers],
  providers: [HomeServices],
})
export class AppModule { }

