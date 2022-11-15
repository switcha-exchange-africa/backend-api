import { ObjectId } from "mongoose";
import { SwitchaDeviceType, USER_LEVEL_TYPE } from "src/lib/constants";

export class User {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  device: SwitchaDeviceType
  password: string
  agreedToTerms: boolean
  authenticator: boolean
  notify: boolean
  country: string
  isAdmin: boolean
  emailVerified: boolean
  phoneVerified: boolean
  lastLoginDate: Date
  lock: boolean;
  transactionPin: string
  avatar: string
  level: USER_LEVEL_TYPE
  dob: string
  isWaitList: boolean
  isSwitchaMerchant: boolean;
  noOfP2pOrderCompleted: number;
  noOfP2pAdsCreated: number;
  noOfP2pOrderCreated: number;
  isBlacklisted: boolean;
  blacklistedReason: string
  blacklistedDate: Date
  createdAt: Date
  updatedAt: Date
  lockedDate: Date;
  lockedReason: string;
  disabledDate: Date;
  disabledReason: Date;
  isDisabled: boolean;
}




