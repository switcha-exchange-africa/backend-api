import { HttpException, Injectable, Logger } from "@nestjs/common";
import { IDataServices, INotificationServices } from "src/core/abstracts";
import { User } from "src/core/entities/user.entity";
import { DISCORD_VERIFICATION_CHANNEL_LINK, INCOMPLETE_AUTH_TOKEN_VALID_TIME, JWT_USER_PAYLOAD_TYPE } from "src/lib/constants";
import jwtLib from "src/lib/jwtLib";
import { AlreadyExistsException } from "./exceptions";
import { Response } from "express"
import { env } from "src/configuration";
import { randomFixedInteger } from "src/lib/utils";


@Injectable()
export class AuthServices {
  constructor(
    private dataServices: IDataServices,
    private discordServices: INotificationServices

  ) { }

  // getAllBooks(): Promise<Book[]> {
  //   return this.dataServices.books.getAll();
  // }

  // getBookById(id: any): Promise<Book> {
  //   return this.dataServices.books.get(id);
  // }

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
      if (!user?.emailVerified!) verification.push("email")
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

      // await this.crmServices.bookAdded(createdBook);
      return {
        message: "User signed up successfully",
        token: `Bearer ${token}`,
        user: jwtPayload,
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

}
