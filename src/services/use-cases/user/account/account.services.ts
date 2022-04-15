// transaction pin
// kyc
// verify phone number
// id card

import { HttpException, Injectable, Logger } from "@nestjs/common";
import { env } from "src/configuration";
import { IDataServices } from "src/core/abstracts";
import { IInMemoryServices } from "src/core/abstracts/in-memory.abstract";
import { RedisPrefix, RESET_PASSWORD_EXPIRY } from "src/lib/constants";
import {
  compareHash,
  hash,
  isEmpty,
  randomFixedInteger,
  secondsToDhms,
} from "src/lib/utils";
import {
  BadRequestsException,
  DoesNotExistsException,
  TooManyRequestsException,
} from "../exceptions";

@Injectable()
export class AccountServices {
  constructor(
    private dataServices: IDataServices,
    private inMemoryServices: IInMemoryServices
  ) {}

  async createTransactionPin(userId: string, pin: string) {
    try {
      const user = await this.dataServices.users.findOne({ _id: userId });
      if (!user) throw new DoesNotExistsException("user does not exists");
      const hashedPin = await hash(pin);
      await this.dataServices.users.update(
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
      const user = await this.dataServices.users.findOne({ _id: userId });
      if (!user) throw new DoesNotExistsException("user does not exists");
      const comparePin = await compareHash(oldPin, user?.transactionPin);
      if (!comparePin)
        throw new BadRequestsException("old transaction pin is invalid");
      const hashedPin = await hash(pin);
      await this.dataServices.users.update(
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
      const user = await this.dataServices.users.findOne({ _id: userId });
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
        await this.dataServices.users.update(
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
      const user = await this.dataServices.users.findOne({ _id: userId });
      if (!user) throw new DoesNotExistsException("user does not exists");
      const document = {
        documentType,
        url,
      };
      await this.dataServices.users.update(
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
      const user = await this.dataServices.users.findOne({ _id: userId });
      if (!user) throw new DoesNotExistsException("user does not exists");
      await this.dataServices.users.update(
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
}
