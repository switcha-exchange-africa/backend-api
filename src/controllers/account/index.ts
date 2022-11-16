import {
  Body,
  Controller,
  HttpException,
  Logger,
  Post,
  Put,
  Req,
  Res,
} from "@nestjs/common";
import { ACCOUNT_ROUTE } from "src/lib/route-constant";
import { AccountServices } from "src/services/use-cases/user/account/account.services";
import { Response, Request } from "express";
import {
  KycDto,
  TxPinDto,
  UpdateTxPinDto,
  UploadAvatarDto,
  UploadIdDto,
} from "src/core/dtos/account/kyc.dto";
import { isAuthenticated } from "src/core/decorators";

@Controller()
export class AccountController {
  constructor(private accountServices: AccountServices) { }

  @Put(ACCOUNT_ROUTE.KYC)
  @isAuthenticated('strict')
  async kyc(@Req() req: Request, @Res() res: Response, @Body() body: KycDto) {
    try {
      const { userType, phone, code } = body;
      const userId = req?.user?._id;
      const response = await this.accountServices.kyc({
        userId,
        userType,
        phone,
        code,
      });
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @Put(ACCOUNT_ROUTE.UPLOAD_ID_CARD)
  @isAuthenticated('strict')
  async uploadIdCard(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UploadIdDto
  ) {
    try {
      const userId = req?.user?._id;
      const { documentType, url } = body;
      const response = await this.accountServices.uploadIdCard({
        userId,
        documentType,
        url,
      });
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @Post(ACCOUNT_ROUTE.TRANSACTION_PIN)
  @isAuthenticated('strict')
  async createTransactionPin(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: TxPinDto
  ) {
    try {
      const userId = req?.user?._id;
      const { pin } = body;
      const response = await this.accountServices.createTransactionPin(
        userId,
        pin
      );
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @Put(ACCOUNT_ROUTE.TRANSACTION_PIN)
  @isAuthenticated('strict')
  async updateTransactionPin(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UpdateTxPinDto
  ) {
    try {
      const userId = req?.user?._id;
      const { pin, oldPin } = body;
      const response = await this.accountServices.updateTransactionPin({
        userId,
        pin,
        oldPin,
      });
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @Put(ACCOUNT_ROUTE.UPLOAD_AVATAR)
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
  @Put('/account/enable-two-fa')
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

}
