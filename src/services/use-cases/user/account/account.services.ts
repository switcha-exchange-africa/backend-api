import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Types } from "mongoose";
import { env } from "src/configuration";
import { IDataServices, INotificationServices } from "src/core/abstracts";
import { IInMemoryServices } from "src/core/abstracts/in-memory.abstract";
import { IErrorReporter } from "src/core/types/error";
import { ResponseState } from "src/core/types/response";
import { DISCORD_VERIFICATION_CHANNEL_LINK, ONE_HOUR_IN_SECONDS, RedisPrefix, RESET_PASSWORD_EXPIRY } from "src/lib/constants";
import {
  compareHash,
  hash,
  isEmpty,
  randomFixedInteger,
  secondsToDhms,
} from "src/lib/utils";
import { UtilsServices } from "../../utils/utils.service";
import {
  BadRequestsException,
  DoesNotExistsException,
  TooManyRequestsException,
} from "../exceptions";
import * as speakeasy from 'speakeasy';
import { TwoFaFactoryService } from "../user-factory.service";
import { IChangePassword, ICheckTwoFaCode, ICreateTransactionPin, IUpdatePhone, IUpdateTransactionPin } from "src/core/dtos/account/kyc.dto";

@Injectable()
export class AccountServices {
  constructor(
    private data: IDataServices,
    private inMemoryServices: IInMemoryServices,
    private readonly utilsService: UtilsServices,
    private readonly twoFaFactory: TwoFaFactoryService,
    private readonly discordServices: INotificationServices,

  ) { }

  async createTransactionPin(payload: ICreateTransactionPin) {
    const { userId, pin, email } = payload
    try {

      const hashedPin = await hash(pin);
      await this.data.users.update(
        { _id: userId },
        { transactionPin: hashedPin }
      );

      return {
        status: HttpStatus.CREATED,
        message: "Transaction pin created successfully",
        state: ResponseState.SUCCESS,
        data: {}
      };
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'CREATING TRANSACTION PIN',
        error,
        email,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }
  async updateTransactionPin(payload: IUpdateTransactionPin) {
    const { userId, pin, oldPin, email } = payload;

    try {
      const user = await this.data.users.findOne({ _id: userId });
      if (!user) {
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          error: null,
          message: "User does not exists"
        })
      };

      const comparePin = await compareHash(oldPin, user?.transactionPin);
      if (!comparePin) {
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          error: null,
          message: "Old transaction pin is invalid"
        })
      }
      const hashedPin = await hash(pin);
      await this.data.users.update(
        { _id: user?._id },
        { transactionPin: hashedPin }
      );
      return {
        status: HttpStatus.OK,
        message: "Transaction pin updated successfully",
        data: {},
        state: ResponseState.SUCCESS
      };
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'UPDATING TRANSACTION PIN',
        error,
        email,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async issuePhoneVerificationCode(phone: string) {
    try {
      console.log(phone);
    } catch (error) {
      if (error.name === "TypeError") {
        throw new HttpException(error.message, 500);
      }
      Logger.error(error);
      throw error;
    }
  }

  async kyc(payload: {
    userType: string;
    phone: string;
    userId: string;
    code: string;
  }) {
    try {
      const { userType, phone, userId, code } = payload;
      const user = await this.data.users.findOne({ _id: userId });
      if (!user) throw new DoesNotExistsException("user does not exists");

      const phoneCodeCountKey = `${RedisPrefix.phoneCodeCount}/${user?.email}`;
      const phoneVerificationCodeRedisKey = `${RedisPrefix.phoneVerificationCode}/${user?.email}`;

      const codeSentInPast24H = await this.inMemoryServices.get(
        phoneCodeCountKey
      );
      if (codeSentInPast24H) {
        const ttl = await this.inMemoryServices.ttl(phoneCodeCountKey);
        const timeToRetry = Math.ceil(Number(ttl));
        const nextTryOpening = secondsToDhms(timeToRetry);
        throw new TooManyRequestsException(
          `Phone was recently updated. Try again in ${nextTryOpening}`
        );
      }

      // for mobile users only

      const codeSent = await this.inMemoryServices.get(
        phoneVerificationCodeRedisKey
      );
      if (!code) {
        if (codeSent) {
          const codeExpiry =
            ((await this.inMemoryServices.ttl(
              phoneVerificationCodeRedisKey
            )) as Number) || 0;
          return {
            status: 202,
            message: `Provide the code sent to your phone or request another one in ${Math.ceil(
              Number(codeExpiry) / 60
            )} minute`,
            nextRequestInSecs: Number(codeExpiry),
          };
        }

        try {
          const phoneCode = randomFixedInteger(6);
          const hashedPhoneCode = await hash(String(phoneCode));
          await this.inMemoryServices.set(
            phoneVerificationCodeRedisKey,
            hashedPhoneCode,
            String(RESET_PASSWORD_EXPIRY)
          );
          return {
            status: 202,
            message: "Provide the code sent to your mobile number",
            code: env.isProd ? null : phoneCode,
          };
        } catch (error) {
          if (error.name === "TypeError") {
            throw new HttpException(error.message, 500);
          }
          Logger.error(error);
          throw error;
        }
      } else {
        const phoneVerifyDocument = codeSent as string;
        if (isEmpty(phoneVerifyDocument)) {
          throw new BadRequestsException(`code is invalid or has expired`);
        }
        const correctCode = await compareHash(
          String(code).trim(),
          (phoneVerifyDocument || "").trim()
        );
        if (!correctCode) {
          throw new BadRequestsException(`code is invalid or has expired`);
        }

        await this.inMemoryServices.del(phoneVerificationCodeRedisKey);
        // update phone
        await this.data.users.update(
          { _id: user?._id },
          {
            $set: {
              userType,
              phone,
            },
          }
        );
        return {
          status: 200,
          message: "Kyc level one completed",
        };
      }
    } catch (error) {
      if (error.name === "TypeError") {
        throw new HttpException(error.message, 500);
      }
      Logger.error(error);
      throw error;
    }
  }

  async uploadIdCard(payload: {
    documentType: string;
    url: string;
    userId: string;
  }) {
    try {
      const { documentType, url, userId } = payload;
      const user = await this.data.users.findOne({ _id: userId });
      if (!user) throw new DoesNotExistsException("user does not exists");
      const document = {
        documentType,
        url,
      };
      await this.data.users.update(
        { _id: user?._id },
        { $set: { document } }
      );
      return {
        status: 200,
        message: "Document updated",
      };
    } catch (error) {
      if (error.name === "TypeError") {
        throw new HttpException(error.message, 500);
      }
      Logger.error(error);
      throw error;
    }
  }

  async uploadAvatar(payload: { url: string; userId: string }) {
    try {
      const { userId, url } = payload;
      const user = await this.data.users.findOne({ _id: userId });
      if (!user) throw new DoesNotExistsException("user does not exists");
      await this.data.users.update(
        { _id: user?._id },
        { $set: { avatar: url } }
      );
      return {
        status: 200,
        message: "Uploaded Avatar",
      };
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw error;
    }
  }

  async enableAuthenticator(payload: { userId: string, email: string }) {
    const { userId, email } = payload
    try {
      await this.data.users.update({ _id: userId }, { authenticator: true })
      return {
        message: "Authenticator enabled successfully",
        status: HttpStatus.OK,
        data: {},
      }

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'ENABLE AUTHENTICATOR',
        error,
        email,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async updatePhone(payload: IUpdatePhone) {
    const { userId, email, phone } = payload
    try {
      await this.data.users.update({ _id: userId }, { phone })
      return {
        message: "Phone number updated successfully",
        status: HttpStatus.OK,
        data: {},
      }

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'ENABLE AUTHENTICATOR',
        error,
        email,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }



  async disableAuthenticator(payload: { userId: string, email: string }) {
    const { userId, email } = payload

    try {
      await this.data.users.update({ _id: userId }, { authenticator: false })
      return {
        message: "Authenticator disabled successfully",
        status: HttpStatus.OK,
        data: {},
      }

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'DISABLE AUTHENTICATOR',
        error,
        email,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async checkTwoFa(payload: ICheckTwoFaCode) {
    const { email, code } = payload

    try {
      const twoFa = await this.data.twoFa.findOne({ email });
      if (!twoFa) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Two fa not setup',
          state: ResponseState.ERROR,
          error: null,
        };
      }

      const isValid = await speakeasy.totp.verify({
        secret: twoFa.secret,
        encoding: 'base32',
        token: code,
      });
      if (!isValid) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Two fa code is invalid',
          state: ResponseState.ERROR,
          error: null,
        };
      }
      return {
        status: HttpStatus.OK,
        message: 'Code is valid',
        data: {},
        state: ResponseState.SUCCESS,
      }

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'CHECK TWO FA VALID AUTHENTICATOR',
        error,
        email,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }
  async generateAuthenticator(payload: { userId: string, email: string }) {
    const { userId, email } = payload

    try {
      const [twoFaCode, getTwoFaDetails, user] = await Promise.all([
        speakeasy.generateSecret(),
        this.data.twoFa.findOne({ email }),
        this.data.users.findOne({ email })
      ]);
      const twoFaPayload = {
        secret: twoFaCode.base32,
        email,
        userId
      }
      if (!user.authenticator) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: '2Fa is not enabled',
          state: ResponseState.ERROR,
          error: null,
        };
      }
      if (!getTwoFaDetails) {
        const factory = await this.twoFaFactory.create(twoFaPayload)
        await this.data.twoFa.create(factory)
        return {
          status: HttpStatus.OK,
          message: 'Two fa generated successfully',
          data: {
            url: twoFaCode.otpauth_url,
            secret: twoFaCode.base32
          },
          state: ResponseState.SUCCESS,
        }
      }

      await this.data.twoFa.update({ email }, { secret: twoFaCode.base32, })
      return {
        status: HttpStatus.OK,
        message: 'Two fa generated successfully',
        data: {
          url: twoFaCode.otpauth_url,
          secret: twoFaCode.base32
        },
        state: ResponseState.SUCCESS,
      }

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'GENERATE AUTHENTICATOR',
        error,
        email,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }
  async enableNotification(id: Types.ObjectId) {
    try {
      await this.data.users.update({ _id: id }, { notify: true })
      return {
        message: "Notification enabled successfully",
        status: HttpStatus.OK,
        data: {},
      }

    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }

  async disableNotification(id: Types.ObjectId) {
    try {
      await this.data.users.update({ _id: id }, { notify: false })
      return {
        message: "Notification disabled successfully",
        status: HttpStatus.OK,
        data: {},
      }

    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }

  async changePassword(payload: IChangePassword) {
    const { email, oldPassword, password, userId, code } = payload

    try {
      const user = await this.data.users.findOne({ _id: userId })
      if (!user) {
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: 'User not found',
          error: null
        })
      }
      const redisKey = `change--${email}`
      // await this.inMemoryServices.del(redisKey)
      if (isEmpty(code)) {
        // send code to user phone number
        const verificationCode = randomFixedInteger(6)
        const hashedCode = await hash(String(verificationCode))
        await Promise.all([
          this.discordServices.inHouseNotification({
            title: `Change Password Verification code :- ${env.env} environment`,
            message: `
              Verification code for user ${email} :- ${verificationCode}

            `,
            link: DISCORD_VERIFICATION_CHANNEL_LINK,
          }),
          this.inMemoryServices.set(redisKey, hashedCode, String(ONE_HOUR_IN_SECONDS))

        ])
        return {
          message: "Verification code sent to your email",
          status: HttpStatus.ACCEPTED,
          data: env.isProd ? null : verificationCode,
        }
      }
      // check verification code
      const savedCode = await this.inMemoryServices.get(redisKey);
      if (isEmpty(savedCode)) return Promise.reject({
        status: HttpStatus.BAD_REQUEST,
        state: ResponseState.ERROR,
        message: 'Code is incorrect, invalid or has expired',
        error: null,
      })

      const correctCode = await compareHash(String(code).trim(), (savedCode || '').trim())
      if (!correctCode) return Promise.reject({
        status: HttpStatus.BAD_REQUEST,
        state: ResponseState.ERROR,
        message: 'Code is incorrect, invalid or has expired',
        error: null,
      })

      const correctPassword: boolean = await compareHash(oldPassword, user?.password);
      if (!correctPassword) return Promise.reject({
        status: HttpStatus.BAD_REQUEST,
        state: ResponseState.ERROR,
        message: 'Email or Password is incorrect',
        error: null,
      })

      await this.data.users.update({ _id: userId }, { password: await hash(password) })
      return {
        status: HttpStatus.OK,
        message: 'Password changed successfully',
        data: {},
        state: ResponseState.SUCCESS,
      }

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'CHECK TWO FA VALID AUTHENTICATOR',
        error,
        email,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }
}
