import { PaginationType } from "src/core/types/database"

export type IGetUsers = PaginationType & {
  id: string
  country: string
  emailVerified: string
  device: string
  lock: string
  level: string
  dob: string
  firstName: string
  lastName: string
  username: string
  email: string
  agreedToTerms: string
  lastLoginDate: string
  createdAt: string
  isWaitList: boolean
  isSwitchaMerchant: boolean
}

export type IGetLoginHistory = PaginationType & {
  id: string
  platform: string
  location: string
  browser: string
  durationTimeInSec: string
  durationTimeInMin: string
  userId: string
  type: string
}