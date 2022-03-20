import {
  Prop,
  Schema,
  SchemaFactory
} from '@nestjs/mongoose';
import { INotificationUserType } from 'src/core/entities/notification.entity';


export type NotificationDocument = Notification & Document;

@Schema()
export class Notification {
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
  sentTo: INotificationUserType
  
  @Prop()
  processedBy: INotificationUserType
  
  @Prop()
  createdAt: Date

  @Prop()
  updatedAt: Date


}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

  