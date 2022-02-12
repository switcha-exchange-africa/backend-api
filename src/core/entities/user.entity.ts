import { SwitchaDeviceType, USER_LOCK, USER_SIGNUP_STATUS_TYPE, USER_TYPE, VERIFICATION_VALUE_TYPE } from "src/lib/constants";

export class User {
  firstName: string

  lastName: string

  email: string

  device: SwitchaDeviceType

  password: string

  agreedToTerms: boolean

  country: string

  isAdmin: boolean

  emailVerified: VERIFICATION_VALUE_TYPE

  phoneVerified: VERIFICATION_VALUE_TYPE

  verified: VERIFICATION_VALUE_TYPE

  lastLoginDate: Date

  createdAt: Date

  dob: Date

  phone?: string

  updatedAt: Date

  lock: USER_LOCK;

  authStatus: USER_SIGNUP_STATUS_TYPE

  userType: USER_TYPE
}

