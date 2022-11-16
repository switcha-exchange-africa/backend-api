import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Types } from "mongoose";
import { env } from "src/configuration";
import { IDataServices } from "src/core/abstracts";
import { IInMemoryServices } from "src/core/abstracts/in-memory.abstract";
import { IErrorReporter } from "src/core/types/error";
import { ResponseState } from "src/core/types/response";
import { RedisPrefix, RESET_PASSWORD_EXPIRY } from "src/lib/constants";
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

@Injectable()
export class AccountServices {
  constructor(
    private data: IDataServices,
    private inMemoryServices: IInMemoryServices,
    private readonly utilsService: UtilsServices,

  ) { }

  async createTransactionPin(userId: string, pin: string) {
    try {
      const user = await this.data.users.findOne({ _id: userId });
      if (!user) throw new DoesNotExistsException("user does not exists");
      const hashedPin = await hash(pin);
      await this.data.users.update(
        { _id: user?._id },
        { transactionPin: hashedPin }
      );
      return { status: 201, message: "transaction pin created successfully" };
    } catch (error) {
      if (error.name === "TypeError") {
        throw new HttpException(error.message, 500);
      }
      Logger.error(error);
      throw error;
    }
  }
  async updateTransactionPin(payload: {
    userId: string;
    pin: string;
    oldPin: string;
  }) {
    try {
      const { userId, pin, oldPin } = payload;
      const user = await this.data.users.findOne({ _id: userId });
      if (!user) throw new DoesNotExistsException("user does not exists");
      const comparePin = await compareHash(oldPin, user?.transactionPin);
      if (!comparePin)
        throw new BadRequestsException("old transaction pin is invalid");
      const hashedPin = await hash(pin);
      await this.data.users.update(
        { _id: user?._id },
        { transactionPin: hashedPin }
      );
      return { status: 200, message: "transaction pin updated successfully" };
    } catch (error) {
      if (error.name === "TypeError") {
        throw new HttpException(error.message, 500);
      }
      Logger.error(error);
      throw error;
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
}
