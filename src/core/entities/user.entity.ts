import { SwitchaDeviceType, UserIDDocumentType, USER_LOCK, USER_SIGNUP_STATUS_TYPE, USER_TYPE } from "src/lib/constants";



export class User {
  firstName: string

  lastName: string

  email: string

  device: SwitchaDeviceType

  password: string

  agreedToTerms: boolean

  country: string

  isAdmin: boolean

  emailVerified: boolean

  phoneVerified: boolean

  lastLoginDate: Date

  createdAt: Date

  dob: Date

  phone?: string

  updatedAt: Date

  lock: USER_LOCK;

  authStatus: USER_SIGNUP_STATUS_TYPE

  userType: USER_TYPE

  transactionPin?: string

  document: UserIDDocumentType

  avatar: string

  authenticator: boolean

  notify: boolean

}

