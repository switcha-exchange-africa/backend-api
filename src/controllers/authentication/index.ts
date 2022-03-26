import { Body, Controller, Get, HttpException, Logger, Post, Query, Req, Res, UseGuards } from "@nestjs/common"
import { AUTHENTICATION_ROUTE } from "src/lib/constants"
import { Request, Response } from "express"
import { AuthServices } from "src/services/use-cases/user/auth-services.services"
import { CreateUserDto } from "src/core/dtos/user.dto"
import { VerifyUserDto } from "src/core/dtos/verifyEmail.dto"
import { LooseAuthGuard } from "src/middleware-guards/auth-guard.middleware"
import { ResetPasswordBodyDto, ResetPasswordDto } from "src/core/dtos/resetPasswordDto.dto"
import { RecoverPasswordDto } from "src/core/dtos/recoverPasswordDto.dto"
import { LoginDto } from "src/core/dtos/authentication/login.dto"

@Controller()
export class AuthenticationController {
  constructor(
    private authServices: AuthServices,

  ) { }

  @Post(AUTHENTICATION_ROUTE.SIGNUP)
  async signup(
    @Res() res: Response,
    @Body() body: CreateUserDto
  ) {
    try {

      const response = await this.authServices.createUser(body, res)
      return res.status(response.status).json(response)
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError") throw new HttpException(error.message, 500);
      return res.status(error.status || 500).json(error);
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
      return res.status(error.status || 500).json(error);
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
      return res.status(error.status || 500).json(error);
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
      const response = await this.authServices.verifyEmail(req, res, body)
      return res.status(200).json(response)
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError") throw new HttpException(error.message, 500);
      return res.status(error.status || 500).json(error);
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
      return res.status(error.status || 500).json(error);
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
      return res.status(error.status || 500).json(error);
    }
  }



}