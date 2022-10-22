import {
  Prop,
  Schema,
  SchemaFactory
} from '@nestjs/mongoose';
import { Types, now, Document } from 'mongoose';
import { WebPushKey } from 'src/core/entities/WebPush';


export type WebPushDocument = WebPush & Document;


@Schema()
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

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;

}

export const WebPushSchema = SchemaFactory.createForClass(WebPush);
