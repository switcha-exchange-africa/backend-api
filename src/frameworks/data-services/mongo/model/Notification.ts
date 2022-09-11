import {
  Prop,
  Schema,
  SchemaFactory
} from '@nestjs/mongoose';
import { Types } from 'mongoose';


export type NotificationDocument = Notification & Document;

@Schema()
export class Notification {
  @Prop({ default: false })
  seen: boolean

  @Prop()
  message: string;

  @Prop()
  link: string;

  @Prop()
  email: string

  @Prop()
  title: string

  @Prop()
  image: string

  @Prop()
  github: string

  @Prop()
  author: string

  @Prop()
  video: string

  @Prop()
  createdAt: Date

  @Prop()
  updatedAt: Date

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true
  })
  userId: string;


}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
