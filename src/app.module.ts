import { Module } from "@nestjs/common";
import controllers from "./controllers";
import { JWT_USER_PAYLOAD_TYPE } from "./lib/constants";
import modules from './modules';

declare global {
  namespace Express {
    export interface Request {
      user?: JWT_USER_PAYLOAD_TYPE;
    }
  }

  var io: any;
}
@Module({
  imports: [...modules],
  controllers: [...controllers],
  providers: [],
})
export class AppModule { }

