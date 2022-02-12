import { HttpException, Injectable, Logger } from "@nestjs/common";
import { IDataServices, INotificationServices } from "src/core/abstracts";
import { User } from "src/core/entities/user.entity";
import { DISCORD_VERIFICATION_CHANNEL_LINK, INCOMPLETE_AUTH_TOKEN_VALID_TIME, JWT_USER_PAYLOAD_TYPE, RedisPrefix, SIGNUP_CODE_EXPIRY, USER_SIGNUP_STATUS_TYPE, VERIFICATION_VALUE_TYPE } from "src/lib/constants";
import jwtLib from "src/lib/jwtLib";
import { AlreadyExistsException, BadRequestsException, DoesNotExistsException } from "./exceptions";
import { Response, Request } from "express"
import { env } from "src/configuration";
import { compareHash, hash, isEmpty, randomFixedInteger } from "src/lib/utils";
import { IInMemoryServices } from "src/core/abstracts/in-memory.abstract";


@Injectable()
export class AuthServices {
  constructor(
    private dataServices: IDataServices,
    private discordServices: INotificationServices,
    private inMemoryServices: IInMemoryServices

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
        `${RedisPrefix.signupEmailCode}/${user?.email}`,
        hashedCode,
        SIGNUP_CODE_EXPIRY
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
      const { code } = req.body;
      const authUser = req?.user!;

      const user = await this.dataServices.users.findOne({ email: authUser.email });
      const redisKey = `${RedisPrefix.signupEmailCode}/${user?.email}`

      const verification: string[] = []
      if (user) {
        throw new DoesNotExistsException('user does not exists')
      }

      if (user?.emailVerified) {
        throw new AlreadyExistsException('user email already exists')
      }
      if (user?.verified) {
        throw new AlreadyExistsException('user already verified')
      }


      const savedCode = await this.inMemoryServices.get(redisKey);
      if (isEmpty(savedCode)) {
        throw new BadRequestsException('code is incorrect, invalid or has expired')
      }

      const correctCode = await compareHash(String(code).trim(), (savedCode || '').trim())
      if (!correctCode) {
        throw new BadRequestsException('code is incorrect, invalid or has expired')
      }

      const updatedUser = await this.dataServices.users.update({ _id: user?._id }, {
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

      await await this.inMemoryServices.del(redisKey);

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
}
