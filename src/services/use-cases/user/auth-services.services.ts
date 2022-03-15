import { WalletServices } from 'src/services/use-cases/wallet/wallet-services.services';
import { HttpException, Injectable, Logger } from "@nestjs/common";
import { IDataServices, INotificationServices } from "src/core/abstracts";
import { User } from "src/core/entities/user.entity";
import { DISCORD_VERIFICATION_CHANNEL_LINK, INCOMPLETE_AUTH_TOKEN_VALID_TIME, JWT_USER_PAYLOAD_TYPE, RedisPrefix, RESET_PASSWORD_EXPIRY, SIGNUP_CODE_EXPIRY, USER_LOCK, USER_SIGNUP_STATUS_TYPE, VERIFICATION_VALUE_TYPE } from "src/lib/constants";
import jwtLib from "src/lib/jwtLib";
import {
  AlreadyExistsException,
  BadRequestsException,
  DoesNotExistsException,
  ForbiddenRequestException,
  TooManyRequestsException
} from "./exceptions";
import { Response, Request } from "express"
import { env } from "src/configuration";
import { compareHash, hash, isEmpty, maybePluralize, randomFixedInteger, secondsToDhms } from "src/lib/utils";
import { IInMemoryServices } from "src/core/abstracts/in-memory.abstract";
import { randomBytes } from 'crypto'

@Injectable()
export class AuthServices {
  constructor(
    private dataServices: IDataServices,
    private discordServices: INotificationServices,
    private inMemoryServices: IInMemoryServices,
    private walletServices: WalletServices

  ) { }

  async createUser(data: User, res: Response) {
    try {

      // checks if user already exists
      const userExists = await this.dataServices.users.findOne({ email: data.email });
      if (userExists) {
        throw new AlreadyExistsException('User already exists')
      }

      const phoneExists = await this.dataServices.users.findOne({ email: data.phone });
      if (phoneExists) {
        throw new AlreadyExistsException('User already exists')
      }
      // create user
      // sends verification code
      // call to our dependencies

      const user = await this.dataServices.users.create(data);
      const redisKey = `${RedisPrefix.signupEmailCode}/${user?.email}`

      const verification: string[] = []
      if (user?.emailVerified === VERIFICATION_VALUE_TYPE.FALSE) verification.push("email")
      // setup jwt
      // setup jwt 
      const jwtPayload: JWT_USER_PAYLOAD_TYPE = {
        _id: user?._id,
        fullName: `${user?.firstName} ${user?.lastName}`,
        email: user?.email,
        authStatus: user?.authStatus,
        lock: user?.lock,
        emailVerified: user?.emailVerified,
        verified: user?.verified
      }
      const token = (await jwtLib.jwtSign(jwtPayload, `${INCOMPLETE_AUTH_TOKEN_VALID_TIME}h`)) as string;
      res.set('Authorization', `Bearer ${token}`);
      const code = randomFixedInteger(6)
      await this.discordServices.inHouseNotification({
        title: `Email Verification code :- ${env.env} environment`,
        message: `Verification code for ${jwtPayload?.fullName}-${jwtPayload?.email} is ${code}`,
        link: DISCORD_VERIFICATION_CHANNEL_LINK,
      })
      const hashedCode = await hash(String(code));
      await this.inMemoryServices.set(
        redisKey,
        hashedCode,
        String(SIGNUP_CODE_EXPIRY)
      )
      return {
        message: "User signed up successfully",
        token: `Bearer ${token}`,
        user: jwtPayload,
        code: env.isDev || env.isStaging ? code : null,
        verification
      };
    } catch (error) {
      if (error.name === 'TypeError') {
        throw new HttpException(error.message, 500)
      }
      Logger.error(error)
      throw error;
    }
  }

  async verifyEmail(req: Request, res: Response, code: string) {
    try {
      const authUser = req?.user!;

      const redisKey = `${RedisPrefix.signupEmailCode}/${authUser?.email}`
      const verification: string[] = []

      if (authUser?.emailVerified === VERIFICATION_VALUE_TYPE.TRUE) {
        throw new AlreadyExistsException('user email already verified')
      }
      if (authUser?.verified === VERIFICATION_VALUE_TYPE.TRUE) {
        throw new AlreadyExistsException('user already verified')
      }

      const savedCode = await this.inMemoryServices.get(redisKey);

      if (isEmpty(savedCode)) {
        console.log("code not found", savedCode)
        throw new BadRequestsException('code is incorrect, invalid or has expired')
      }

      const correctCode = await compareHash(String(code).trim(), (savedCode || '').trim())
      if (!correctCode) {
        console.log("does not match", correctCode)
        console.log("code", code)
        console.log("saved code", savedCode)
        throw new BadRequestsException('code is incorrect, invalid or has expired')
      }

      const updatedUser = await this.dataServices.users.update({ _id: authUser?._id }, {
        $set: {
          emailVerified: VERIFICATION_VALUE_TYPE.TRUE,
          verified: VERIFICATION_VALUE_TYPE.TRUE,
          authStatus: USER_SIGNUP_STATUS_TYPE.COMPLETED,
          lastLoginDate: new Date(),
        }
      })
      // Remove phone code for this user
      const jwtPayload: JWT_USER_PAYLOAD_TYPE = {
        _id: updatedUser?._id,
        fullName: updatedUser?.fullName,
        email: updatedUser?.email,
        authStatus: USER_SIGNUP_STATUS_TYPE.COMPLETED,
        lock: updatedUser?.lock,
        emailVerified: updatedUser.emailVerified,
        verified: updatedUser.verified
      }
      if (updatedUser?.emailVerified! === VERIFICATION_VALUE_TYPE.FALSE) verification.push("email")

      const token = (await jwtLib.jwtSign(jwtPayload)) as string;
      if (!res.headersSent) res.set('Authorization', `Bearer ${token}`);

      await this.inMemoryServices.del(redisKey);
      await this.walletServices.create(authUser?._id)
      return {
        message: 'User email is verified successfully',
        token: `Bearer ${token}`,
        ...jwtPayload,
        verification
      }

    } catch (error: Error | any | unknown) {
      if (error.name === 'TypeError') {
        throw new HttpException(error.message, 500)
      }
      Logger.error(error)
      throw error;
    }
  }

  async issueEmailVerificationCode(req: Request) {
    try {
      const authUser = req?.user;
      if (!authUser) {
        throw new BadRequestsException('user not recognized')
      }
      if (authUser?.emailVerified === VERIFICATION_VALUE_TYPE.TRUE) {
        throw new AlreadyExistsException('user email already verified')
      }
      if (authUser?.verified === VERIFICATION_VALUE_TYPE.TRUE) {
        throw new AlreadyExistsException('user already verified')
      }

      const redisKey = `${RedisPrefix.signupEmailCode}/${authUser?.email}`
      const codeSent = await this.inMemoryServices.get(redisKey) as number

      if (codeSent) {
        const codeExpiry = await this.inMemoryServices.ttl(redisKey) as Number || 0;
        // taking away 4 minutes from the wait time
        const nextRequest = Math.abs(Number(codeExpiry) / 60 - 4);
        if (Number(codeExpiry && Number(codeExpiry) > 4)) {
          return {
            status: 202,
            message: `if you have not received the verification code, please make another request in ${Math.ceil(
              nextRequest,
            )} ${maybePluralize(Math.ceil(nextRequest), 'minute', 's')}`
          }
        }
      }

      const emailCode = randomFixedInteger(6)
      // Remove email code for this user
      await this.inMemoryServices.del(redisKey)
      const user = await this.dataServices.users.findOne({ email: authUser?.email })
      const verification: string[] = []
      if (user?.emailVerified! === VERIFICATION_VALUE_TYPE.FALSE) verification.push("email")

      if (!user) {
        throw new DoesNotExistsException('user does not exists')

      }
      // hash verification code in redis
      const hashedCode = await hash(String(emailCode));
      // save hashed code to redis
      await this.inMemoryServices.set(
        redisKey,
        hashedCode,
        String(SIGNUP_CODE_EXPIRY)
      )
      await this.discordServices.inHouseNotification({
        title: `Email Verification code :- ${env.env} environment`,
        message: `Verification code for ${user?.firstName} ${user?.lastName}-${user?.email} is ${emailCode}`,
        link: DISCORD_VERIFICATION_CHANNEL_LINK,
      })
      return {
        status: 200,
        message: 'New code was successfully generated',
        code: env.isProd ? null : emailCode,
        verification
      };
    } catch (error: Error | any | unknown) {
      if (error.name === 'TypeError') {
        throw new HttpException(error.message, 500)
      }
      Logger.error(error)
      throw error;
    }
  }

  async resetPassword(res: Response, payload: {
    email: string,
    password: string,
    token: string
  }) {
    try {
      const { email, password, token } = payload
      const passwordResetCountKey = `${RedisPrefix.passwordResetCount}/${email}`
      const resetPasswordRedisKey = `${RedisPrefix.resetpassword}/${email}`

      const userRequestReset = await this.inMemoryServices.get(resetPasswordRedisKey);
      if (!userRequestReset) {
        console.log(email, password, token)
        console.log("reset password key", userRequestReset)
        throw new BadRequestsException('Invalid or expired reset token')
      }
      // Find user by email
      const user = await this.dataServices.users.findOne({ email: String(email) });
      // Check if user has requested password reset
      if (!user) {
        throw new DoesNotExistsException('user does not exists')
      }
      // If reset link is valid and not expired
      const validReset = await compareHash(String(token), userRequestReset);
      if (!validReset) {
        throw new BadRequestsException('Invalid or expired reset token')
      }
      // Store update users password
      const hashedPassword = await hash(password);
      const twenty4H = 1 * 60 * 60 * 24;

      // Remove reset token for this user 
      await this.inMemoryServices.del(resetPasswordRedisKey)
      await this.inMemoryServices.set(passwordResetCountKey, 1, String(twenty4H))

      // save reset count for next 24 hours
      // remove stored cookie so it reinstate otp
      res.cookie('deviceTag', '');
      await this.dataServices.users.update(
        { email: user.email },
        {
          $set: {
            verified: true,
            emailVerified: true,
            phoneVerified: true,
            password: hashedPassword
          }
        })
      return {
        status: 200,
        message: 'Password updated successfully',
      }

    } catch (error: Error | any | unknown) {
      if (error.name === 'TypeError') {
        throw new HttpException(error.message, 500)
      }
      Logger.error(error)
      throw error;
    }
  }
  async recoverPassword(payload: { email: string, code: string }) {
    try {
      let { email, code } = payload;
      const passwordResetCountKey = `${RedisPrefix.passwordResetCount}/${email}`
      const resetPasswordRedisKey = `${RedisPrefix.resetpassword}/${email}`
      const resetCodeRedisKey = `${RedisPrefix.resetCode}/${email}`

      const resetInPast24H = await this.inMemoryServices.get(passwordResetCountKey)
      if (resetInPast24H) {
        const ttl = await this.inMemoryServices.ttl(passwordResetCountKey)
        const timeToRetry = Math.ceil(Number(ttl));
        const nextTryOpening = secondsToDhms(timeToRetry);
        throw new TooManyRequestsException(`Password was recently updated. Try again in ${nextTryOpening}`)
      }

      const user = await this.dataServices.users.findOne({ email });
      if (!user) {
        throw new BadRequestsException(`code is invalid or has expired`)
      }
    
      // for mobile users only

      const codeSent = await this.inMemoryServices.get(resetCodeRedisKey);
      if (!code) {

        if (codeSent) {
          const codeExpiry = await this.inMemoryServices.ttl(resetCodeRedisKey) as Number || 0;
          return {
            status: 202,
            message: `Provide the code sent to your email or request another one in ${Math.ceil(
              Number(codeExpiry) / 60,
            )} minute`,
            nextRequestInSecs: Number(codeExpiry)
          }
        }

        try {
          const phoneCode = randomFixedInteger(6)
          const hashedPhoneCode = await hash(String(phoneCode));
          await this.inMemoryServices.set(
            resetCodeRedisKey,
            hashedPhoneCode,
            String(RESET_PASSWORD_EXPIRY)
          );
          return {
            status: 202,
            message: 'Provide the code sent to your mobile number',
            code: env.isProd ? null : phoneCode
          };
        } catch (error) {
          if (error.name === 'TypeError') {
            throw new HttpException(error.message, 500)
          }
          Logger.error(error)
          throw error;
        }
      } else {
        const phoneVerifyDocument = codeSent as string;
        if (isEmpty(phoneVerifyDocument)) {
          throw new BadRequestsException(`code is invalid or has expired`)

        }
        const correctCode = await compareHash(String(code).trim(), (phoneVerifyDocument || '').trim());
        if (!correctCode) {
          throw new BadRequestsException(`code is invalid or has expired`)
        }

        // Generate Reset token
        const resetToken = randomBytes(32).toString('hex');
        const hashedResetToken = await hash(resetToken);

        // Remove all reset token for this user if it exists
        await this.inMemoryServices.del(resetCodeRedisKey)
        await this.inMemoryServices.del(resetPasswordRedisKey)

        await this.inMemoryServices.set(
          resetPasswordRedisKey,
          hashedResetToken,
          String(RESET_PASSWORD_EXPIRY)
        )


        return {
          status: 200,
          message: 'You will receive an email with a link to reset your password if you have an account with this email.',
          resetSecret: env.isProd ? null : resetToken,
          resetToken: env.isProd ? null : resetToken
        }

      }
    } catch (error: Error | any | unknown) {
      if (error.name === 'TypeError') {
        throw new HttpException(error.message, 500)
      }
      Logger.error(error)
      throw error;
    }
  }

  async login(res: Response, payload: { email: string, password: string }) {
    try {
      const { email, password } = payload
      const user = await this.dataServices.users.findOne({ email });
      if (!user) {
        throw new DoesNotExistsException('user does not exists')
      }
      const verification: string[] = []
      if (user.lock === USER_LOCK.LOCK) {
        throw new ForbiddenRequestException('account is temporary locked')
      }
      const correctPassword: boolean = await compareHash(password, user?.password!);
      if (!correctPassword) {
        throw new BadRequestsException('password is incorrect') //
      }
      if (user?.emailVerified === VERIFICATION_VALUE_TYPE.FALSE) {
        verification.push("email")
        const jwtPayload: JWT_USER_PAYLOAD_TYPE = {
          _id: user?._id,
          fullName: user?.fullName,
          email: user?.email,
          authStatus: USER_SIGNUP_STATUS_TYPE.PENDING,
          lock: user?.lock,
          emailVerified: user.emailVerified,
          verified: user.verified
        }
        const token = await jwtLib.jwtSign(jwtPayload, `${INCOMPLETE_AUTH_TOKEN_VALID_TIME}h`);
        return {
          status: 403,
          message: 'email is not verified',
          token: `Bearer ${token}`,
          verification
        }
      }

      if (user.verified === VERIFICATION_VALUE_TYPE.FALSE) {
        const jwtPayload: JWT_USER_PAYLOAD_TYPE = {
          _id: user?._id,
          fullName: user?.fullName,
          email: user?.email,
          authStatus: USER_SIGNUP_STATUS_TYPE.PENDING,
          lock: user?.lock,
          emailVerified: user.emailVerified,
          verified: user.verified
        }
        const token = await jwtLib.jwtSign(jwtPayload, `${INCOMPLETE_AUTH_TOKEN_VALID_TIME}h`);
        return {
          status: 403,
          message: 'user is not verified',
          token: `Bearer ${token}`,
          verification
        }
      }
      const jwtPayload: JWT_USER_PAYLOAD_TYPE = {
        _id: user?._id,
        fullName: `${user?.firstName} ${user?.lastName}`,
        email: user?.email,
        authStatus: USER_SIGNUP_STATUS_TYPE.COMPLETED,
        lock: user?.lock,
        emailVerified: user.emailVerified,
        verified: user.verified
      }
      const token = await jwtLib.jwtSign(jwtPayload);
      res.set('Authorization', `Bearer ${token}`);
      await this.dataServices.users.update({ _id: user._id }, {
        $set: {
          lastLoginDate: new Date()
        }
      })
      return {
        status: 200,
        message: 'User logged in successfully',
        token: `Bearer ${token}`,
        ...jwtPayload,
        verification
      }
    } catch (error: Error | any | unknown) {
      if (error.name === 'TypeError') {
        throw new HttpException(error.message, 500)
      }
      Logger.error(error)
      throw error;
    }
  }
}



