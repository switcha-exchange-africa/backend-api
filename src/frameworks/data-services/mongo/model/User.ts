import {
  Prop,
  Schema,
  SchemaFactory
} from '@nestjs/mongoose';
import {
  SwitchaDeviceType,
  SWITCHA_DEVICES,
  USER_LEVEL_LIST,
  USER_LEVEL_TYPE
} from 'src/lib/constants';
import {  Document } from "mongoose";

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  username: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  dob: string;

  @Prop({
    required: true,
    enum: SWITCHA_DEVICES,
  })
  device: SwitchaDeviceType

  @Prop()
  password: string

  @Prop()
  agreedToTerms: boolean

  @Prop({ default: false })
  authenticator: boolean

  @Prop({ default: false })
  notify: boolean

  @Prop()
  country: string

  @Prop()
  isAdmin: boolean

  @Prop({ default: false })
  emailVerified: boolean

  @Prop({ default: false })
  phoneVerified: boolean

  @Prop()
  lastLoginDate: Date

  @Prop()
  createdAt: Date

  @Prop()
  updatedAt: Date

  @Prop({ default: false })
  lock: boolean;

  @Prop({ default: false })
  isWaitList: boolean;

  @Prop({ default: false })
  isSwitchaMerchant: boolean;

  @Prop()
  transactionPin: string

  @Prop({ enum: USER_LEVEL_LIST })
  level: USER_LEVEL_TYPE

  @Prop()
  avatar: string


}

export const UserSchema = SchemaFactory.createForClass(User);

