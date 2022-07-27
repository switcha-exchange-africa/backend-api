import { Injectable } from '@nestjs/common';
import { SignupDto } from 'src/core/dtos/user.dto';
import { User } from 'src/core/entities/user.entity';
import { USER_LOCK, USER_SIGNUP_STATUS_TYPE, USER_TYPE } from 'src/lib/constants';
import { hash } from 'src/lib/utils';

@Injectable()
export class UserFactoryService {
  async createNewUser(data: SignupDto) {
    const user = new User();
    if (data.firstName) user.firstName = data.firstName;
    if (data.lastName) user.lastName = data.lastName;
    if (data.email) user.email = data.email;
    if (data.device) user.device = data.device;
    if (data.password) user.password = await hash(data.password);
    if (data.agreedToTerms) user.agreedToTerms = data.agreedToTerms;
    if (data.country) user.country = data.country;
    if (data.isAdmin) user.isAdmin = data.isAdmin;
    if (data.phone) user.phone = data.phone;
    user.emailVerified = false;
    user.phoneVerified = false
    user.authStatus = USER_SIGNUP_STATUS_TYPE.PENDING;
    user.userType = USER_TYPE.CLIENT;
    user.lock = USER_LOCK.UNLOCK;
    user.createdAt = new Date();
    user.updatedAt = new Date();
    user.lastLoginDate = new Date();
    return user;
  }

}
