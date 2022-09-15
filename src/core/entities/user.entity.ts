import { SwitchaDeviceType, USER_LEVEL_TYPE } from "src/lib/constants";



export class User {
  username: string
  firstName: string;
  lastName: string;
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
  createdAt: Date
  dob: Date
  updatedAt: Date
  lock: boolean;
  transactionPin: string
  level: USER_LEVEL_TYPE
  avatar: string

}

