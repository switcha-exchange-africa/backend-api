import {
  Body,
  Controller,
  Get,
  HttpException,
  Logger,
  Post,
  Req,
  Res,
  UseGuards
} from "@nestjs/common"
import {
  AUTHENTICATION_ROUTE,
  DISCORD_VERIFICATION_CHANNEL_LINK,
  TEST_ROUTE,
  USER_LOCK,
  USER_SIGNUP_STATUS_TYPE,
  USER_TYPE,
  VERIFICATION_VALUE_TYPE
} from "src/lib/constants"
import { Request, Response } from "express"
import { UserFactoryService } from "src/services/use-cases/user/user-factory.service"
import { AuthServices } from "src/services/use-cases/user/auth-services.services"
import { CreateUserDto } from "src/core/dtos/user.dto"
import { hash } from "src/lib/utils"
import { IInMemoryServices } from "src/core/abstracts/in-memory.abstract"
import { VerifyUserDto } from "src/core/dtos/verifyEmail.dto"
import { LooseAuthGuard, StrictAuthGuard } from "src/middleware-guards/auth-guard.middleware"

@Controller()
export class AuthenticationController {
  constructor(
    private authServices: AuthServices,
    private userFactoryService: UserFactoryService,
    private inMemoryServices: IInMemoryServices

  ) { }

  @Post(AUTHENTICATION_ROUTE.SIGNUP)
  async signup(
    @Res() res: Response,
    @Body() userDto: CreateUserDto
  ) {
    try {

      const payload = {
        ...userDto,
        password: await hash(userDto.password),
        userType: USER_TYPE.CLIENT,
        lock: USER_LOCK.UNLOCK,
        authStatus: USER_SIGNUP_STATUS_TYPE.PENDING,
        emailVerified: VERIFICATION_VALUE_TYPE.FALSE,
        verified: VERIFICATION_VALUE_TYPE.FALSE,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const user = await this.userFactoryService.createNewUser(payload);
      const createdUser = await this.authServices.createUser(user, res)
      // send email verification code to discord and mailgun 
      return res.status(201).json(createdUser)
    } catch (error) {
      if (error.name === 'TypeError') {
        Logger.error(error)
        throw new HttpException(error.message, 500)
      }
      Logger.error(error)
      return res.status(error.status || 500).json(error)
    }
  }

  @Post(AUTHENTICATION_ROUTE.LOGIN)
  async login(@Req() req: Request, @Res() res: Response) {
    try {
      return res.status(201).json("authenticated")
    } catch (e) {
      return res.status(500).json(e)
    }
  }

  @Get(AUTHENTICATION_ROUTE.ISSUE_VERIFICATION_CODE)
  async issueVerificationCode(@Req() req: Request, @Res() res: Response) {
    try {
      return res.status(201).json("authenticated")
    } catch (e) {
      return res.status(500).json(e)
    }
  }



  @Post(AUTHENTICATION_ROUTE.VERIFY_USER)
  @UseGuards(LooseAuthGuard)
  async verifyUser(
    @Req() req: Request,
    @Res() res: Response,
    @Body() code: VerifyUserDto
  ) {
    try {
      const response = await this.authServices.verifyEmail(req, res, String(code))
      return res.status(201).json(response)
    } catch (error) {
      if (error.name === 'TypeError') {
        Logger.error(error)
        throw new HttpException(error.message, 500)
      }
      Logger.error(error)
      return res.status(error.status || 500).json(error)
    }
  }

  @Post(TEST_ROUTE.TEST)
  async testRoute(@Req() req: Request, @Res() res: Response) {
    try {
      const value = await this.inMemoryServices.get('test')
      return res.status(201).json({value})
    } catch (e) {
      return res.status(500).json(e)
    }
  }
}