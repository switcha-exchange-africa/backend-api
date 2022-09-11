import { USER_LOCK } from "src/lib/constants";

export class Admin {
  firstName: string;
  lastName: string;
  email: string;
  password: string
  lastLoginDate: Date
  createdAt: Date
  updatedAt: Date
  lock: USER_LOCK;
  image: string;
  roles: string[]
  twoFa: boolean
}
