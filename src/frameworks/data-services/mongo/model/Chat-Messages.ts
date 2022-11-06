import {
  Prop,
  Schema,
  SchemaFactory
} from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';


export type ChatMessageDocument = ChatMessage & Document;


@Schema({
  timestamps: true

})
export class ChatMessage {

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true
  })
  userId: string;

  @Prop({
    type: Types.ObjectId,
    ref: "Admin",
  })
  adminId: string;

  @Prop()
  message: string

  @Prop({ default: false })
  read: boolean

  @Prop()
  tradeDisputeId: string

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

}

const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

ChatMessageSchema.index({
  message: 'text',
  adminId: 'text',
  userId: 'text',
  tradeDisputeId: 'text',
  _id: 'text',

},
  {
    weights: {
      message: 5,
      adminId: 4,
      userId: 4,
      tradeDisputeId: 4,
      _id: 5,

    },
  });

export { ChatMessageSchema }