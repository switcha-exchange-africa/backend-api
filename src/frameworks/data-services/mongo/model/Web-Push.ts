import {
  Prop,
  Schema,
  SchemaFactory
} from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { WebPushKey } from 'src/core/entities/WebPush';


export type WebPushDocument = WebPush & Document;


@Schema({
  timestamps: true

})
export class WebPush {


  @Prop({ type: { auth: String, p256dh: String } })
  key: WebPushKey

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true
  })
  userId: string;

  @Prop()
  endpoint: string

  @Prop()
  expirationTime: number

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

}

export const WebPushSchema = SchemaFactory.createForClass(WebPush);
