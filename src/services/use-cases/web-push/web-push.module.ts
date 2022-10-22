
import { Module } from "@nestjs/common";
import { AxiosServiceModule } from "src/frameworks/http/axios/axios-service.module";
import { DiscordServicesModule } from "src/frameworks/notification-services/discord/discord-service.module";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import {  WebPushFactoryService,  } from "./web-push-factory.service";
import { WebPushServices } from "./web-push.service";


@Module({
  imports: [
    DataServicesModule,
    AxiosServiceModule,
    DiscordServicesModule,
  ],
  providers: [
    WebPushFactoryService,
    WebPushServices
  ],
  exports: [
    WebPushFactoryService,
    WebPushServices
  ]
})

export class WebPushServicesModule { }