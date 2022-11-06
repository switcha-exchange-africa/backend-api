import { Injectable } from "@nestjs/common";
import { ChatMessage } from "src/core/entities/Chat-Messages";
import { OptionalQuery } from "src/core/types/database";

@Injectable()
export class ChatMessagesFactoryService {
  create(data: OptionalQuery<ChatMessage>) {
    const messages = new ChatMessage();
    if (data.userId) messages.userId = data.userId;
    if (data.adminId) messages.adminId = data.adminId;
    if (data.message) messages.message = data.message;
    if (data.read) messages.read = data.read;
    if (data.tradeDisputeId) messages.tradeDisputeId = data.tradeDisputeId;

    return messages;
  }
}
