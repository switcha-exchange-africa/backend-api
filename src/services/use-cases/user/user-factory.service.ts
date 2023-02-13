import { Injectable } from '@nestjs/common';
import { LoginHistory } from 'src/core/entities/LoginHistory';
import { MutateUser } from 'src/core/entities/MutateUser';
import { TwoFa } from 'src/core/entities/TwoFa';
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
    if (data.username) user.username = data.username.trim().toLowerCase();
    if (data.email) user.email = data.email.trim().toLowerCase();
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
    user.authenticator = false
    user.notify = false

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
    if (data.canP2PCreateBuyAd) manage.canP2PCreateBuyAd = data.canP2PCreateBuyAd;
    if (data.canP2PCreateSellAd) manage.canP2PCreateSellAd = data.canP2PCreateSellAd;

    return manage;
  }


}

@Injectable()
export class MutateUserFactoryService {
  async mutate(data: OptionalQuery<MutateUser>) {
    const mutate = new MutateUser();
    if (data.userId) mutate.userId = data.userId;
    if (data.reason) mutate.reason = data.reason;
    if (data.active) mutate.active = data.active;
    if (data.type) mutate.type = data.type;

    return mutate;
  }


}

@Injectable()
export class TwoFaFactoryService {
  async create(data: OptionalQuery<TwoFa>) {
    const twoFa = new TwoFa();
    if (data.userId) twoFa.userId = data.userId;
    if (data.email) twoFa.email = data.email;
    if (data.securityQuestion) twoFa.securityQuestion = data.securityQuestion;
    if (data.securityAnswer) twoFa.securityAnswer = data.securityAnswer;
    if (data.secret) twoFa.secret = data.secret;

    return twoFa;
  }


}



@Injectable()
export class LoginHistoryFactoryService {
  async create(data: OptionalQuery<LoginHistory>) {
    const result = new LoginHistory();
    if (data.userId) result.userId = data.userId;
    if (data.ip) result.ip = data.ip;
    if (data.platform) result.platform = data.platform;
    if (data.location) result.location = data.location;
    if (data.headers) result.headers = data.headers;
    if (data.userAgent) result.userAgent = data.userAgent;
    if (data.browser) result.browser = data.browser
    if (data.country) result.country = data.country
    if (data.countryCode) result.countryCode = data.countryCode
    if (data.region) result.region = data.region
    if (data.regionName) result.regionName = data.regionName
    if (data.city) result.city = data.city
    if (data.lat) result.lat = data.lat
    if (data.lon) result.lon = data.lon
    if (data.timezone) result.timezone = data.timezone
    if (data.type) result.type = data.type

    return result;
  }
}