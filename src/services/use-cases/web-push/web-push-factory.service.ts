import { Injectable } from "@nestjs/common";
import { WebPush } from "src/core/entities/WebPush";
import { OptionalQuery } from "src/core/types/database";

@Injectable()
export class WebPushFactoryService {
  create(data: OptionalQuery<WebPush>) {
    const push = new WebPush();
    if (data.key) push.key = data.key;
    if (data.userId) push.userId = data.userId;
    if (data.endpoint) push.endpoint = data.endpoint;
    if (data.expirationTime) push.expirationTime = data.expirationTime;
    return push;
  }
}
