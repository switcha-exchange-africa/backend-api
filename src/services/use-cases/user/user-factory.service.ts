import { Injectable } from '@nestjs/common';
import { User } from 'src/core/entities/user.entity';
import { UserFeatureManagement } from 'src/core/entities/UserFeatureManagement';
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
    if (data.isWaitList) user.isWaitList = data.isWaitList;
    if (data.isSwitchaMerchant) user.isSwitchaMerchant = data.isSwitchaMerchant;
    if (data.noOfP2pOrderCompleted) user.noOfP2pOrderCompleted = data.noOfP2pOrderCompleted;
    if (data.noOfP2pAdsCreated) user.noOfP2pAdsCreated = data.noOfP2pAdsCreated;
    if (data.noOfP2pOrderCreated) user.noOfP2pOrderCreated = data.noOfP2pOrderCreated;

    
    user.emailVerified = false;
    user.lock = false;
    user.authenticator=false
    user.notify=false
   
    user.lastLoginDate = new Date();
    return user;
  }

}

@Injectable()
export class UserFeatureManagementFactoryService {
  async manageUser(data: OptionalQuery<UserFeatureManagement>) {
    const manage = new UserFeatureManagement();
    if (data.userId) manage.userId = data.userId;
    if (data.canBuy) manage.canBuy = data.canBuy;
    if (data.canSell) manage.canSell = data.canSell;
    if (data.canSwap) manage.canSwap = data.canSwap;
    if (data.canP2PBuy) manage.canP2PBuy = data.canP2PBuy;
    if (data.canP2PSell) manage.canP2PSell = data.canP2PSell;
    if (data.canWithdraw) manage.canWithdraw = data.canWithdraw;

    return manage;
  }

}