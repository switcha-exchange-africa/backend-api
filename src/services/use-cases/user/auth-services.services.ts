import { VerifyUserDto } from 'src/core/dtos/verifyEmail.dto';
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { IDataServices, INotificationServices } from "src/core/abstracts";
import { DISCORD_VERIFICATION_CHANNEL_LINK, INCOMPLETE_AUTH_TOKEN_VALID_TIME, JWT_USER_PAYLOAD_TYPE, RedisPrefix, RESET_PASSWORD_EXPIRY, SIGNUP_CODE_EXPIRY, USER_LOCK, USER_SIGNUP_STATUS_TYPE } from "src/lib/constants";
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
import { SignupDto } from 'src/core/dtos/user.dto';
import { UserFactoryService } from './user-factory.service';
import { ResponsesType } from 'src/core/types/response';
import { User } from 'src/core/entities/user.entity';
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class AuthServices {
  constructor(
    private dataServices: IDataServices,
    private discordServices: INotificationServices,
    private inMemoryServices: IInMemoryServices,
    private factory: UserFactoryService,
    private emitter: EventEmitter2,

  ) { }

  async signup(data: SignupDto, res: Response): Promise<ResponsesType<User>> {
    try {

      const [userExists, phoneExists] = await Promise.all([this.dataServices.users.findOne({ email: data.email }), this.dataServices.users.findOne({ email: data.phone })]);
      if (userExists) throw new AlreadyExistsException('User already exists')
      if (phoneExists) throw new AlreadyExistsException('User already exists')


      const factory = await this.factory.createNewUser(data);
      const user = await this.dataServices.users.create(factory);
      const redisKey = `${RedisPrefix.signupEmailCode}/${user?.email}`

      const verification: string[] = []
      if (!user.emailVerified) verification.push("email")

      const jwtPayload: JWT_USER_PAYLOAD_TYPE = {
        _id: user._id,
        fullName: `${user.firstName} ${user?.lastName}`,
        email: user.email,
        authStatus: user.authStatus,
        lock: user.lock,
        emailVerified: user.emailVerified,
      }
      const token = await jwtLib.jwtSign(jwtPayload, `${INCOMPLETE_AUTH_TOKEN_VALID_TIME}h`) as string;
      const code = randomFixedInteger(6)
      const hashedCode = await hash(String(code));

      res.set('Authorization', `Bearer ${token}`);

      await Promise.all([
        this.discordServices.inHouseNotification({
          title: `Email Verification code :- ${env.env} environment`,
          message: `Verification code for ${jwtPayload?.fullName}-${jwtPayload?.email} is ${code}`,
          link: DISCORD_VERIFICATION_CHANNEL_LINK,
        }),
        this.inMemoryServices.set(redisKey, hashedCode, String(SIGNUP_CODE_EXPIRY))
      ])

      return {
        status: 201,
        message: "User signed up successfully",
        token: `Bearer ${token}`,
        data: jwtPayload,
        extra: env.isDev || env.isStaging ? code : null,
        verification
      };
    } catch (error) {
      Logger.error(error)
      if (error.name === 'TypeError') throw new HttpException(error.message, 500)
      throw error;
    }
  }

  async verifyEmail(req: Request, res: Response, body: VerifyUserDto): Promise<ResponsesType<User>> {
    const { code } = body;

    try {
      const authUser = req?.user!;

      const redisKey = `${RedisPrefix.signupEmailCode}/${authUser?.email}`
      const verification: string[] = []

      if (authUser.emailVerified) throw new AlreadyExistsException('User email already verified')

      const savedCode = await this.inMemoryServices.get(redisKey);
      if (isEmpty(savedCode)) throw new BadRequestsException('Code is incorrect, invalid or has expired')


      const correctCode = await compareHash(String(code).trim(), (savedCode || '').trim())
      if (!correctCode) throw new BadRequestsException('Code is incorrect, invalid or has expired')

      const updatedUser = await this.dataServices.users.update({ _id: authUser?._id }, {
        $set: {
          emailVerified: true,
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
      }

      const [token, ,] = await Promise.all([
        jwtLib.jwtSign(jwtPayload),
        this.inMemoryServices.del(redisKey),
        this.emitter.emit("create.wallet", { userId: authUser?._id })
      ])


      if (!res.headersSent) res.set('Authorization', `Bearer ${token}`);
      return { status: 200, message: 'User email is verified successfully', token: `Bearer ${token}`, data: jwtPayload, verification }

    } catch (error: Error | any | unknown) {
      Logger.error(error)
      if (error.name === 'TypeError') throw new HttpException(error.message, 500)
      throw error;
    }
  }

  async issueEmailVerificationCode(req: Request): Promise<ResponsesType<User>> {
    try {
      const authUser = req?.user!;
      if (authUser.emailVerified) return {
        status: HttpStatus.ACCEPTED,
        message: `User already verified`,
        data: null
      }

      const redisKey = `${RedisPrefix.signupEmailCode}/${authUser?.email}`
      const codeSent = await this.inMemoryServices.get(redisKey) as number
      const verification: string[] = []

      if (codeSent) {
        const codeExpiry = await this.inMemoryServices.ttl(redisKey) as Number || 0;
        // taking away 4 minutes from the wait time
        const nextRequest = Math.abs(Number(codeExpiry) / 60 - 4);
        if (Number(codeExpiry && Number(codeExpiry) > 4)) {
          return {
            status: 202,
            message: `if you have not received the verification code, please make another request in ${Math.ceil(
              nextRequest,
            )} ${maybePluralize(Math.ceil(nextRequest), 'minute', 's')}`,
            data: null
          }
        }
      }

      const emailCode = randomFixedInteger(6)
      // Remove email code for this user
      const [user,] = await Promise.all([this.dataServices.users.findOne({ email: authUser?.email }), this.inMemoryServices.del(redisKey)])
      if (!user.emailVerified) verification.push("email")
      if (!user) throw new DoesNotExistsException('User does not exists')


      // hash verification code in redis
      const hashedCode = await hash(String(emailCode));
      await Promise.all([
        this.inMemoryServices.set(redisKey, hashedCode, String(SIGNUP_CODE_EXPIRY)),
        await this.discordServices.inHouseNotification({
          title: `Email Verification code :- ${env.env} environment`,
          message: `Verification code for ${user?.firstName} ${user?.lastName}-${user?.email} is ${emailCode}`,
          link: DISCORD_VERIFICATION_CHANNEL_LINK,
        })
      ])
      // save hashed code to redis 

      return {
        status: HttpStatus.OK,
        message: 'New code was successfully generated',
        data: env.isProd ? null : String(emailCode),
        verification
      };
    } catch (error: Error | any | unknown) {
      Logger.error(error)
      if (error.name === 'TypeError') throw new HttpException(error.message, 500)
      throw error;
    }
  }

  async resetPassword(res: Response, payload: { email: string, password: string, token: string }): Promise<ResponsesType<User>> {
    try {

      const { email, password, token } = payload
      const passwordResetCountKey = `${RedisPrefix.passwordResetCount}/${email}`
      const resetPasswordRedisKey = `${RedisPrefix.resetpassword}/${email}`

      const [userRequestReset, user] = await Promise.all([this.inMemoryServices.get(resetPasswordRedisKey), this.dataServices.users.findOne({ email: String(email) })]);
      if (!userRequestReset) throw new BadRequestsException('Invalid or expired reset token')
      if (!user) throw new DoesNotExistsException('user does not exists')

      // If reset link is valid and not expired
      const validReset = await compareHash(String(token), userRequestReset);
      if (!validReset) throw new BadRequestsException('Invalid or expired reset token')

      // Store update users password
      const twenty4H = 1 * 60 * 60 * 24;

      const [hashedPassword, ,] = await Promise.all([hash(password), this.inMemoryServices.del(resetPasswordRedisKey), this.inMemoryServices.set(passwordResetCountKey, 1, String(twenty4H))]);
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
      return { status: 200, data: 'password updated successfully', message: 'password updated successfully' }

    } catch (error: Error | any | unknown) {
      Logger.error(error)
      if (error.name === 'TypeError') throw new HttpException(error.message, 500);
      throw error;
    }
  }
  async recoverPassword(payload: { email: string, code: string }): Promise<ResponsesType<User>> {
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
      if (!user) throw new BadRequestsException(`code is invalid or has expired`)


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
            data: `seconds ${codeExpiry}`
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
            data: env.isProd ? null : String(phoneCode)
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
        if (isEmpty(phoneVerifyDocument)) throw new BadRequestsException(`code is invalid or has expired`)
        const correctCode = await compareHash(String(code).trim(), (phoneVerifyDocument || '').trim());
        if (!correctCode) throw new BadRequestsException(`code is invalid or has expired`)

        // Generate Reset token
        const resetToken = randomBytes(32).toString('hex');
        const hashedResetToken = await hash(resetToken);

        // Remove all reset token for this user if it exists
        await Promise.all([
          this.inMemoryServices.del(resetCodeRedisKey),
          this.inMemoryServices.del(resetPasswordRedisKey),
          this.inMemoryServices.set(
            resetPasswordRedisKey,
            hashedResetToken,
            String(RESET_PASSWORD_EXPIRY)
          )
        ])

        return {
          status: 200,
          message: 'You will receive an email with a link to reset your password if you have an account with this email.',
          data: env.isProd ? null : resetToken,
        }

      }
    } catch (error: Error | any | unknown) {
      Logger.error(error)
      if (error.name === 'TypeError') throw new HttpException(error.message, 500)
      throw error;
    }
  }

  async login(res: Response, payload: { email: string, password: string }): Promise<ResponsesType<User>> {
    try {
      const { email, password } = payload
      const user = await this.dataServices.users.findOne({ email });

      const verification: string[] = []
      if (!user) throw new DoesNotExistsException('User does not exists')
      if (user.lock === USER_LOCK.LOCK) throw new ForbiddenRequestException('Account is temporary locked')


      const correctPassword: boolean = await compareHash(password, user?.password!);
      if (!correctPassword) throw new BadRequestsException('Password is incorrect') //

      if (!user.emailVerified) {

        verification.push("email")
        const jwtPayload: JWT_USER_PAYLOAD_TYPE = {
          _id: user?._id,
          fullName: user?.fullName,
          email: user?.email,
          authStatus: USER_SIGNUP_STATUS_TYPE.PENDING,
          lock: user?.lock,
          emailVerified: user.emailVerified,
        }

        const token = await jwtLib.jwtSign(jwtPayload, `${INCOMPLETE_AUTH_TOKEN_VALID_TIME}h`);
        return {
          status: HttpStatus.FORBIDDEN,
          message: 'Email is not verified',
          data: 'Email is not verified',
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
        data: jwtPayload,
        verification
      }
    } catch (error: Error | any | unknown) {
      Logger.error(error)
      if (error.name === 'TypeError') throw new HttpException(error.message, 500)
      throw error;
    }
  }
}



