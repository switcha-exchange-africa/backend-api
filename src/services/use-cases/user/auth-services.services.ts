import { VerifyUserDto } from 'src/core/dtos/verifyEmail.dto';
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { IDataServices, INotificationServices } from "src/core/abstracts";
import { DISCORD_VERIFICATION_CHANNEL_LINK, INCOMPLETE_AUTH_TOKEN_VALID_TIME, JWT_USER_PAYLOAD_TYPE, RedisPrefix, RESET_PASSWORD_EXPIRY, SIGNUP_CODE_EXPIRY } from "src/lib/constants";
import jwtLib from "src/lib/jwtLib";
import { Response, Request } from "express"
import { env } from "src/configuration";
import { compareHash, hash, isEmpty, maybePluralize, randomFixedInteger, secondsToDhms } from "src/lib/utils";
import { IInMemoryServices } from "src/core/abstracts/in-memory.abstract";
import { randomBytes } from 'crypto'
import { UserFactoryService } from './user-factory.service';
import { ResponseState, ResponsesType } from 'src/core/types/response';
import { User } from 'src/core/entities/user.entity';
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ILogin, ISignup } from 'src/core/dtos/authentication/login.dto';

@Injectable()
export class AuthServices {
  constructor(
    private data: IDataServices,
    private discordServices: INotificationServices,
    private inMemoryServices: IInMemoryServices,
    private factory: UserFactoryService,
    private emitter: EventEmitter2,

  ) { }

  async signup(data: ISignup): Promise<ResponsesType<User>> {
    try {

      const { email } = data

      const userExists = await this.data.users.findOne({ email })
      if (userExists) return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: 'User already exists',
        error: null
      })

      const factory = await this.factory.createNewUser(data);
      const user = await this.data.users.create(factory);
      const redisKey = `${RedisPrefix.signupEmailCode}/${user?.email}`

      const jwtPayload: JWT_USER_PAYLOAD_TYPE = {
        _id: user._id,
        fullName: `${user.firstName} ${user?.lastName}`,
        email: user.email,
        lock: user.lock,
        emailVerified: user.emailVerified,
      }
      const token = await jwtLib.jwtSign(jwtPayload, `${INCOMPLETE_AUTH_TOKEN_VALID_TIME}h`) as string;
      const code = randomFixedInteger(6)
      const hashedCode = await hash(String(code));

      await Promise.all([
        this.discordServices.inHouseNotification({
          title: `Email Verification code :- ${env.env} environment`,
          message: `Verification code for ${jwtPayload?.fullName}-${jwtPayload?.email} is ${code}`,
          link: DISCORD_VERIFICATION_CHANNEL_LINK,
        }),
        this.inMemoryServices.set(redisKey, hashedCode, String(SIGNUP_CODE_EXPIRY))
      ])

      return {
        status: HttpStatus.CREATED,
        message: "User signed up successfully",
        token: `Bearer ${token}`,
        data: jwtPayload,
        state: ResponseState.SUCCESS,
        extra: env.isDev || env.isStaging ? code : null,
      };

    } catch (error) {
      Logger.error(error)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async verifyEmail(req: Request, res: Response, body: VerifyUserDto): Promise<ResponsesType<User>> {
    try {

      const { code } = body;
      const authUser = req?.user!;

      const redisKey = `${RedisPrefix.signupEmailCode}/${authUser?.email}`
      if (authUser.emailVerified) return {
        message: 'User email already verified',
        status: HttpStatus.ACCEPTED,
        data: authUser,
        state: ResponseState.SUCCESS
      }

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

      const updatedUser = await this.data.users.update({ _id: authUser?._id }, {
        $set: {
          emailVerified: true,
          lastLoginDate: new Date(),
        }
      })
      // Remove phone code for this user
      const jwtPayload: JWT_USER_PAYLOAD_TYPE = {
        _id: updatedUser?._id,
        fullName: updatedUser?.fullName,
        email: updatedUser?.email,
        lock: updatedUser?.lock,
        emailVerified: updatedUser.emailVerified,
      }
      const [token, ,] = await Promise.all([
        jwtLib.jwtSign(jwtPayload),
        this.inMemoryServices.del(redisKey),
        this.emitter.emit("create.wallet", {
          userId: updatedUser._id,
          email: updatedUser.email,
          fullName: `${updatedUser.firstName} ${updatedUser.lastName}`

        })
      ])


      if (!res.headersSent) res.set('Authorization', `Bearer ${token}`);
      return {
        status: 200,
        message: 'User email is verified successfully',
        token: `Bearer ${token}`,
        data: jwtPayload,
        state: ResponseState.SUCCESS,
      }

    } catch (error: Error | any | unknown) {
      Logger.error(error)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async issueEmailVerificationCode(req: Request): Promise<ResponsesType<User>> {
    try {
      const authUser = req?.user!;
      if (authUser.emailVerified) return {
        status: HttpStatus.ACCEPTED,
        message: `User already verified`,
        state: ResponseState.SUCCESS,
        data: null
      }

      const redisKey = `${RedisPrefix.signupEmailCode}/${authUser?.email}`
      const codeSent = await this.inMemoryServices.get(redisKey) as number

      if (codeSent) {
        const codeExpiry = await this.inMemoryServices.ttl(redisKey) as Number || 0;
        // taking away 4 minutes from the wait time
        const nextRequest = Math.abs(Number(codeExpiry) / 60 - 4);
        if (Number(codeExpiry && Number(codeExpiry) > 4)) {
          return {
            status: HttpStatus.ACCEPTED,
            message: `if you have not received the verification code, please make another request in ${Math.ceil(
              nextRequest,
            )} ${maybePluralize(Math.ceil(nextRequest), 'minute', 's')}`,
            state: ResponseState.SUCCESS,
            data: null
          }
        }
      }

      const emailCode = randomFixedInteger(6)
      // Remove email code for this user
      const [user,] = await Promise.all([this.data.users.findOne({ email: authUser?.email }), this.inMemoryServices.del(redisKey)])
      if (!user) return Promise.reject({
        status: HttpStatus.NOT_FOUND,
        state: ResponseState.ERROR,
        message: 'User does not exists',
        error: null
      })


      // hash verification code in redis
      const hashedCode = await hash(String(emailCode));
      await Promise.all([
        this.inMemoryServices.set(redisKey, hashedCode, String(SIGNUP_CODE_EXPIRY)),
        this.discordServices.inHouseNotification({
          title: `Email Verification code :- ${env.env} environment`,
          message: `Verification code for ${user?.firstName} ${user?.lastName}-${user?.email} is ${emailCode}`,
          link: DISCORD_VERIFICATION_CHANNEL_LINK,
        })
      ])
      return {
        status: HttpStatus.OK,
        message: 'New code was successfully generated',
        data: env.isProd ? null : String(emailCode),
        state: ResponseState.SUCCESS,
      };

    } catch (error: Error | any | unknown) {
      Logger.error(error)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async resetPassword(res: Response, payload: { email: string, password: string, token: string }): Promise<ResponsesType<User>> {
    try {

      const { email, password, token } = payload
      const passwordResetCountKey = `${RedisPrefix.passwordResetCount}/${email}`
      const resetPasswordRedisKey = `${RedisPrefix.resetpassword}/${email}`

      const [userRequestReset, user] = await Promise.all([this.inMemoryServices.get(resetPasswordRedisKey), this.data.users.findOne({ email: String(email) })]);
      if (!userRequestReset) return Promise.reject({
        status: HttpStatus.BAD_REQUEST,
        state: ResponseState.ERROR,
        message: 'Invalid or expired reset token',
        error: null
      })
      if (!user) return Promise.reject({
        status: HttpStatus.NOT_FOUND,
        state: ResponseState.ERROR,
        message: 'User does not exists',
        error: null
      })

      // If reset link is valid and not expired
      const validReset = await compareHash(String(token), userRequestReset);
      if (!validReset) return Promise.reject({
        status: HttpStatus.BAD_REQUEST,
        state: ResponseState.ERROR,
        message: 'Invalid or expired reset token',
        error: null
      })

      // Store update users password
      const twenty4H = 1 * 60 * 60 * 24;

      const [hashedPassword, ,] = await Promise.all([hash(password), this.inMemoryServices.del(resetPasswordRedisKey), this.inMemoryServices.set(passwordResetCountKey, 1, String(twenty4H))]);
      res.cookie('deviceTag', '');
      await this.data.users.update(
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
        status: HttpStatus.OK,
        data: 'password updated successfully',
        message: 'password updated successfully',
        state: ResponseState.SUCCESS,
      }

    } catch (error: Error | any | unknown) {
      Logger.error(error)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
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
        return Promise.reject({
          status: HttpStatus.TOO_MANY_REQUESTS,
          state: ResponseState.ERROR,
          message: `Password was recently updated. Try again in ${nextTryOpening}`,
          error: null
        })
      }

      const user = await this.data.users.findOne({ email });
      if (!user) return Promise.reject({
        status: HttpStatus.BAD_REQUEST,
        state: ResponseState.ERROR,
        message: `code is invalid or has expired`,
        error: null
      })

      // for mobile users only
      const codeSent = await this.inMemoryServices.get(resetCodeRedisKey);
      if (!code) {

        if (codeSent) {
          const codeExpiry = await this.inMemoryServices.ttl(resetCodeRedisKey) as Number || 0;
          return {
            status: HttpStatus.ACCEPTED,
            message: `Provide the code sent to your email or request another one in ${Math.ceil(
              Number(codeExpiry) / 60,
            )} minute`,
            data: `seconds ${codeExpiry}`,
            state: ResponseState.SUCCESS,
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
            status: HttpStatus.ACCEPTED,
            message: 'Provide the code sent to your mobile number',
            data: env.isProd ? null : String(phoneCode),
            state: ResponseState.SUCCESS,
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
        if (isEmpty(phoneVerifyDocument)) return Promise.reject({
          status: HttpStatus.BAD_REQUEST,
          state: ResponseState.ERROR,
          message: `code is invalid or has expired`,
          error: null
        })

        const correctCode = await compareHash(String(code).trim(), (phoneVerifyDocument || '').trim());
        if (!correctCode) return Promise.reject({
          status: HttpStatus.BAD_REQUEST,
          state: ResponseState.ERROR,
          message: `code is invalid or has expired`,
          error: null
        })

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
          status: HttpStatus.OK,
          message: 'You will receive an email with a link to reset your password if you have an account with this email.',
          data: env.isProd ? null : resetToken,
          state: ResponseState.SUCCESS,
        }

      }
    } catch (error: Error | any | unknown) {
      Logger.error(error)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async login(payload: ILogin): Promise<ResponsesType<User>> {
    try {
      const { email, password } = payload
      const user = await this.data.users.findOne({ email });

      if (!user) return Promise.reject({
        status: HttpStatus.NOT_FOUND,
        state: ResponseState.ERROR,
        message: 'User does not exists',
        error: null
      })
      if (user.lock) return Promise.reject({
        status: HttpStatus.FORBIDDEN,
        state: ResponseState.ERROR,
        message: 'Account is temporary locked',
        error: null
      })

      const correctPassword: boolean = await compareHash(password, user?.password!);
      if (!correctPassword) return Promise.reject({
        status: HttpStatus.FORBIDDEN,
        state: ResponseState.ERROR,
        message: 'Password is incorrect',
        error: null
      })

      if (!user.emailVerified) {

        const jwtPayload: JWT_USER_PAYLOAD_TYPE = {
          _id: user?._id,
          fullName: user?.fullName,
          email: user?.email,
          lock: user?.lock,
          emailVerified: user.emailVerified,
        }

        const token = await jwtLib.jwtSign(jwtPayload, `${INCOMPLETE_AUTH_TOKEN_VALID_TIME}h`);
        return {
          status: HttpStatus.ACCEPTED,
          message: 'Email is not verified',
          data: 'Email is not verified',
          token: `Bearer ${token}`,
          state: ResponseState.ERROR,
        }
      }

      const jwtPayload: JWT_USER_PAYLOAD_TYPE = {
        _id: user?._id,
        fullName: `${user?.firstName} ${user?.lastName}`,
        email: user?.email,
        lock: user?.lock,
        emailVerified: user.emailVerified,
      }
      const token = await jwtLib.jwtSign(jwtPayload);

      await this.data.users.update({ _id: user._id }, {
        $set: {
          lastLoginDate: new Date()
        }
      })

      return {
        status: HttpStatus.OK,
        message: 'User logged in successfully',
        token: `Bearer ${token}`,
        data: jwtPayload,
        state: ResponseState.SUCCESS,
      }

    } catch (error: Error | any | unknown) {
      Logger.error(error)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async getUser(data: JWT_USER_PAYLOAD_TYPE) {
    try {
      return {
        status: HttpStatus.OK,
        state: ResponseState.SUCCESS,
        message: 'User retrieved successfully',
        data
      }
    } catch (error) {
      Logger.error(error)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error
      })
    }
  }
}



