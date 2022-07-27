import {
  Prop,
  Schema,
  SchemaFactory
} from '@nestjs/mongoose';
import {
  SwitchaDeviceType,
  SWITCHA_DEVICES,
  UserIDDocumentType,
  USER_LEVEL_LIST,
  USER_LEVEL_TYPE,
  USER_LOCK,
  USER_LOCK_LIST,
  USER_SIGNUP_STATUS_TYPE,
  USER_SIGNUP_STATUS_TYPE_LIST,
  USER_TYPE,
  USER_TYPE_LIST,

} from 'src/lib/constants';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop({
    required: true,
    enum: SWITCHA_DEVICES,
  })
  device: SwitchaDeviceType

  @Prop()
  password: string

  @Prop()
  agreedToTerms: boolean

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
  dob: Date

  @Prop()
  updatedAt: Date

  @Prop({ enum: USER_LOCK_LIST })
  lock: USER_LOCK;


  @Prop({ enum: USER_SIGNUP_STATUS_TYPE_LIST })
  authStatus: USER_SIGNUP_STATUS_TYPE

  @Prop({ enum: USER_TYPE_LIST })
  userType: USER_TYPE

  @Prop()
  transactionPin: string

  @Prop({ type: Object })
  document: UserIDDocumentType

  @Prop({ enum: USER_LEVEL_LIST })
  level: USER_LEVEL_TYPE

  @Prop()
  avatar: string

  @Prop()
  roles: string[]

}

export const UserSchema = SchemaFactory.createForClass(User);

