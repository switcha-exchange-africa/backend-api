import { Injectable } from '@nestjs/common';
import { User } from 'src/core/entities/user.entity';
import { OptionalQuery } from 'src/core/types/database';
import { hash } from 'src/lib/utils';

@Injectable()
export class UserFactoryService {
  async createNewUser(data: OptionalQuery<User>) {
    const user = new User();
    if (data.firstName) user.firstName = data.firstName;
    if (data.lastName) user.lastName = data.lastName;
    if (data.username) user.username = data.username;

    if (data.email) user.email = data.email;
    if (data.device) user.device = data.device;
    if (data.password) user.password = await hash(data.password);
    if (data.agreedToTerms) user.agreedToTerms = data.agreedToTerms;
    if (data.country) user.country = data.country;
    if (data.dob) user.dob = data.dob;
    if (data.transactionPin) user.transactionPin = data.transactionPin;
    if (data.level) user.level = data.level;
    if (data.avatar) user.avatar = data.avatar;
    user.emailVerified = false;
    user.lock = false;
    user.authenticator=false
    user.notify=false
    user.createdAt = new Date();
    user.updatedAt = new Date();
    user.lastLoginDate = new Date();
    return user;
  }

}
