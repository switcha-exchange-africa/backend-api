import {
  Body,
  Controller,
  Get,
  HttpException,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UseGuards
} from "@nestjs/common"
import {
  AUTHENTICATION_ROUTE,
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
import { LooseAuthGuard } from "src/middleware-guards/auth-guard.middleware"
import { ResetPasswordBodyDto, ResetPasswordDto } from "src/core/dtos/resetPasswordDto.dto"
import { RecoverPasswordDto } from "src/core/dtos/recoverPasswordDto.dto"
import { LoginDto } from "src/core/dtos/authentication/login.dto"

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
      Logger.error(error);
      if (error.name === "TypeError") throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }

  @Post(AUTHENTICATION_ROUTE.LOGIN)
  async login(
    @Res() res: Response,
    @Body() body: LoginDto
  ) {
    try {
      const { email, password } = body
      const response = await this.authServices.login(res, { email, password })
      return res.status(response.status).json(response)
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError") throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }

  @Get(AUTHENTICATION_ROUTE.VERIFY_USER)
  @UseGuards(LooseAuthGuard)
  async issueEmailVerificationCode(
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const response = await this.authServices.issueEmailVerificationCode(req)
      return res.status(response.status).json(response)
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError") throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }

  @Post(AUTHENTICATION_ROUTE.VERIFY_USER)
  @UseGuards(LooseAuthGuard)
  async verifyUser(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: VerifyUserDto
  ) {
    try {
      const { code } = body
      const response = await this.authServices.verifyEmail(req, res, String(code))
      return res.status(200).json(response)
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError") throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }

  @Post(TEST_ROUTE.TEST)
  async testRoute(@Res() res: Response) {
    try {
      const value = await this.inMemoryServices.get('test')
      return res.status(201).json({ value })
    } catch (e) {
      return res.status(500).json(e)
    }
  }
  @Post(AUTHENTICATION_ROUTE.RECOVER_PASSWORD)
  async recoverPassword(
    @Res() res: Response,
    @Body() body: RecoverPasswordDto
  ) {
    try {
      const { email, code } = body
      const response = await this.authServices.recoverPassword({ email, code })
      return res.status(response.status).json(response)
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError") throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }

  @Post(AUTHENTICATION_ROUTE.RESET_PASSWORD)
  async resetPassword(
    @Res() res: Response,
    @Query() query: ResetPasswordDto,
    @Body() body: ResetPasswordBodyDto
  ) {
    try {
      const { email, token } = query
      const { password } = body
      const response = await this.authServices.resetPassword(res, { email, password, token })
      return res.status(response.status).json(response)
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError") throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }



}