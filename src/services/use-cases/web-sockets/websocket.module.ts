import { Module } from '@nestjs/common';
import { ChatMessageServicesModule } from '../chat-messages/chat-messages.module';
import { WebsocketServiceGateway } from './websocket.gateway';

@Module({
  imports: [ChatMessageServicesModule],
  controllers: [],
  providers: [WebsocketServiceGateway],
})
export class WebsocketServiceModule { }