import {
  Prop,
  Schema,
  SchemaFactory
} from '@nestjs/mongoose';
import { INotificationUserType } from 'src/core/entities/notification.entity';
import {
  SwitchaDeviceType,
  SWITCHA_DEVICES,
  USER_LOCK,
  USER_LOCK_LIST,
  USER_SIGNUP_STATUS_TYPE,
  USER_SIGNUP_STATUS_TYPE_LIST,
  USER_TYPE,
  USER_TYPE_LIST,
  VERIFICATION_VALUE_TYPE,
  VERIFICATION_VALUE_TYPE_LIST
} from 'src/lib/constants';

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

  