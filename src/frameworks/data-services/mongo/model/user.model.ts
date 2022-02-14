import {
  Prop,
  Schema,
  SchemaFactory
} from '@nestjs/mongoose';
import {
  SwitchaDeviceType,
  SWITCHA_DEVICES,
  UserIDDocumentType,
  USER_LOCK,
  USER_LOCK_LIST,
  USER_SIGNUP_STATUS_TYPE,
  USER_SIGNUP_STATUS_TYPE_LIST,
  USER_TYPE,
  USER_TYPE_LIST,
  VERIFICATION_VALUE_TYPE,
  VERIFICATION_VALUE_TYPE_LIST
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

  @Prop({ enum: VERIFICATION_VALUE_TYPE_LIST })
  emailVerified: VERIFICATION_VALUE_TYPE

  @Prop({ enum: VERIFICATION_VALUE_TYPE_LIST })
  phoneVerified: VERIFICATION_VALUE_TYPE


  @Prop({ enum: VERIFICATION_VALUE_TYPE_LIST })
  verified: VERIFICATION_VALUE_TYPE

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
}

export const UserSchema = SchemaFactory.createForClass(User);


