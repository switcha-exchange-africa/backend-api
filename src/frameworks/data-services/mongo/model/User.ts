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
import { Document, ObjectId } from "mongoose";
import { Transform } from 'class-transformer';

export type UserDocument = User & Document;

@Schema({
  toJSON: {
    virtuals: true,
  },
  timestamps: true
})
export class User {
  @Transform(({ value }) => value.toString())
  _id: ObjectId;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ unique: true })
  username: string;

  @Prop({ required: true, unique: true })
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
  phone: string

  @Prop()
  isAdmin: boolean

  @Prop({ default: false })
  emailVerified: boolean

  @Prop({ default: false })
  phoneVerified: boolean

  @Prop()
  lastLoginDate: Date

  @Prop({ default: false })
  lock: boolean;

  @Prop({ default: false })
  isWaitList: boolean;

  @Prop({ default: false })
  isSwitchaMerchant: boolean;

  @Prop({ default: false })
  isBlacklisted: boolean;

  @Prop({ default: false })
  enableTwoFa: boolean;

  @Prop()
  transactionPin: string

  @Prop({ enum: USER_LEVEL_LIST, default: USER_LEVEL_TYPE.ONE })
  level: USER_LEVEL_TYPE

  @Prop()
  avatar: string

  @Prop({
    default: 0
  })
  noOfP2pAdsCreated: number;

  @Prop({
    default: 0
  })
  noOfP2pOrderCreated: number;

  @Prop({
    default: 0
  })
  noOfP2pOrderCompleted: number;

  @Prop()
  createdAt: Date;

  @Prop()
  lockedDate: Date;

  @Prop()
  lockedReason: string;

  @Prop()
  disabledDate: Date;

  @Prop()
  disabledReason: string;

  @Prop()
  blacklistedDate: Date;

  @Prop()
  blacklistedReason: string;

  @Prop({ default: false })
  isDisabled: boolean;

  @Prop()
  updatedAt: Date;
}

const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({
  username: 'text',
  _id: 'text',
  email: 'text',
  id: 'text',
  firstName: 'text',
  lastName: 'text',
  phone: 'text',
},
  {
    weights: {
      username: 5,
      _id: 5,
      email: 5,
      firstName: 5,
      lastName: 5,
      phone: 5,
      id: 5,
    },
  },);

// static methods


export { UserSchema }

// https://medium.com/@phatdev/build-a-full-text-search-with-nestjs-mongodb-elasticsearch-and-docker-final-part-3ff13b93f447