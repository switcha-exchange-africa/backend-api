import { Module } from "@nestjs/common";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { UtilsServicesModule } from "../utils/utils.module";
import { ChatMessagesFactoryService } from "./chat-messages-factory.service";
import { ChatMessagesServices } from "./chat-messages.service";


@Module({
  imports: [DataServicesModule, UtilsServicesModule],
  providers: [ChatMessagesFactoryService, ChatMessagesServices],
  exports: [ChatMessagesFactoryService, ChatMessagesServices],
})
export class ChatMessageServicesModule { }
