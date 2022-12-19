import {
  Body,
  Controller,
  Post,
  Put,
  Req,
  Res,
} from "@nestjs/common";
import { AccountServices } from "src/services/use-cases/user/account/account.services";
import { Response, Request } from "express";
import {
  ChangePasswordDto,
  CheckTwoFaCodeDto,
  IChangePassword,
  ICheckTwoFaCode,
  ICreateTransactionPin,
  IUpdatePhone,
  IUpdateTransactionPin,
  TxPinDto,
  UpdatePhoneDto,
  UpdateTxPinDto,
  UploadAvatarDto,
} from "src/core/dtos/account/kyc.dto";
import { isAuthenticated } from "src/core/decorators";

@Controller("account")
export class AccountController {
  constructor(private accountServices: AccountServices) { }


  @isAuthenticated('strict')
  @Post("/transaction-pin")
  async createTransactionPin(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: TxPinDto
  ) {
    try {

      const userId = req?.user?._id;
      const email = req?.user.email

      const { pin } = body;
      const payload: ICreateTransactionPin = {
        userId,
        pin,
        email
      }
      const response = await this.accountServices.createTransactionPin(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @isAuthenticated('strict')
  @Put("/transaction-pin")
  async updateTransactionPin(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdateTxPinDto
  ) {
    try {

      const userId = req?.user?._id;
      const { pin, oldPin } = body;

      const payload: IUpdateTransactionPin = {
        userId,
        pin,
        oldPin,
        email: req?.user?.email
      }
      const response = await this.accountServices.updateTransactionPin(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @Put("/avatar")
  @isAuthenticated('strict')
  async uploadAvatar(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UploadAvatarDto
  ) {
    try {
      const userId = req?.user?._id;
      const { url } = body;
      const response = await this.accountServices.uploadAvatar({
        userId,
        url,
      });
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @isAuthenticated('strict')
  @Put('/enable-two-fa')
  async enableTwoFa(
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = req?.user?._id;
      const email = req?.user?.email
      const response = await this.accountServices.enableAuthenticator({
        userId,
        email
      });
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }




  @isAuthenticated('strict')
  @Put('/update-phone')
  async updatePhone(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdatePhoneDto
  ) {
    try {
      const userId = req?.user?._id;
      const email = req?.user?.email
      
      const payload:IUpdatePhone = {
        userId,
        email,
        ...body
      }
      const response = await this.accountServices.updatePhone(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }



  @isAuthenticated('strict')
  @Put('/disable-two-fa')
  async disableTwoFa(
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = req?.user?._id;
      const email = req?.user?.email
      const response = await this.accountServices.disableAuthenticator({
        userId,
        email
      });
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @isAuthenticated('strict')
  @Put('/generate-two-fa')
  async generateTwoFa(
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const userId = req?.user?._id;
      const email = req?.user?.email
      const response = await this.accountServices.generateAuthenticator({
        email,
        userId
      });
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @isAuthenticated('strict')
  @Post('/two-fa-valid')
  async checkTwoFa(
    @Req() req: Request,
    @Body() body: CheckTwoFaCodeDto,
    @Res() res: Response
  ) {
    try {
      const userId = req?.user?._id;
      const email = req?.user?.email
      const payload: ICheckTwoFaCode = {
        ...body,
        email,
        userId
      }
      const response = await this.accountServices.checkTwoFa(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @isAuthenticated('strict')
  @Post('/change-password')
  async changePassword(
    @Req() req: Request,
    @Body() body: ChangePasswordDto,
    @Res() res: Response
  ) {
    try {
      const userId = req?.user?._id;
      const email = req?.user?.email
      const payload: IChangePassword = {
        ...body,
        email,
        userId
      }
      const response = await this.accountServices.changePassword(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }
}
