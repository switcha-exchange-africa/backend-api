export class Admin {
  firstName: string;
  lastName: string;
  email: string;
  password: string
  lastLoginDate: Date
  createdAt: Date
  updatedAt: Date
  lock: boolean;
  image: string;
  roles: string[]
  twoFa: boolean
  emailVerified: boolean
}
