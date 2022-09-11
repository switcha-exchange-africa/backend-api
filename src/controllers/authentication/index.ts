import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Request, Response } from "express";
import { AuthServices } from "src/services/use-cases/user/auth-services.services";
import { VerifyUserDto } from "src/core/dtos/verifyEmail.dto";
import { LooseAuthGuard } from "src/middleware-guards/auth-guard.middleware";
import {
  ResetPasswordBodyDto,
  ResetPasswordDto,
} from "src/core/dtos/resetPasswordDto.dto";
import { RecoverPasswordDto } from "src/core/dtos/recoverPasswordDto.dto";
import { ILogin, ISignup, LoginDto, SignupDto } from "src/core/dtos/authentication/login.dto";
import { generateGoogleAuthUrl } from "src/lib/utils";
import { AUTHENTICATION_ROUTE } from "src/lib/route-constant";

@Controller()
export class AuthenticationController {
  constructor(private services: AuthServices) { }

  @Post(AUTHENTICATION_ROUTE.SIGNUP)
  async signup(@Res() res: Response, @Body() body: SignupDto) {
    try {
      const payload: ISignup = { ...body }
      const response = await this.services.signup(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @Post(AUTHENTICATION_ROUTE.LOGIN)
  async login(@Res() res: Response, @Body() body: LoginDto) {
    try {
      const payload: ILogin = { ...body }
      const response = await this.services.login(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @Get(AUTHENTICATION_ROUTE.VERIFY_USER)
  @UseGuards(LooseAuthGuard)
  async issueEmailVerificationCode(@Req() req: Request, @Res() res: Response) {
    try {
      const response = await this.services.issueEmailVerificationCode(req);
      return res.status(response.status).json(response);
    } catch (error) {
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
      const response = await this.services.verifyEmail(req, res, body);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @Post(AUTHENTICATION_ROUTE.RECOVER_PASSWORD)
  async recoverPassword(
    @Res() res: Response,
    @Body() body: RecoverPasswordDto
  ) {
    try {
      const { email, code } = body;
      const response = await this.services.recoverPassword({ email, code });
      return res.status(response.status).json(response);
    } catch (error) {
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
      const { email, token } = query;
      const { password } = body;
      const response = await this.services.resetPassword(res, {
        email,
        password,
        token,
      });
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @Get(AUTHENTICATION_ROUTE.GOOGLE)
  async google(@Res() res: Response) {
    const response = await generateGoogleAuthUrl();
    res.redirect(response);
  }

  @Get(AUTHENTICATION_ROUTE.GET_USER)
  @UseGuards(LooseAuthGuard)
  async getUser(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {

      const response = await this.services.getUser(req?.user);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }
}
