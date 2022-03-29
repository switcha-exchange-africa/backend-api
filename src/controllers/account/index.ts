import {
  Body,
  Controller,
  HttpException,
  Logger,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ACCOUNT_ROUTE } from "src/lib/constants";
import { AccountServices } from "src/services/use-cases/user/account/account.services";
import { Response, Request } from "express";
import {
  KycDto,
  TxPinDto,
  UpdateTxPinDto,
  UploadIdDto,
} from "src/core/dtos/account/kyc.dto";
import { StrictAuthGuard } from "src/middleware-guards/auth-guard.middleware";

@Controller()
export class AccountController {
  constructor(private accountServices: AccountServices) {}

  @Put(ACCOUNT_ROUTE.KYC)
  @UseGuards(StrictAuthGuard)
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
      Logger.error(error);
      if (error.name === "TypeError") throw new HttpException(error.message, 500);
      return res.status(error.status || 500).json(error);
    }
  }

  @Put(ACCOUNT_ROUTE.UPLOAD_ID_CARD)
  @UseGuards(StrictAuthGuard)
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
      Logger.error(error);
      if (error.name === "TypeError") throw new HttpException(error.message, 500);
      return res.status(error.status || 500).json(error);
    }
  }

  @Post(ACCOUNT_ROUTE.TRANSACTION_PIN)
  @UseGuards(StrictAuthGuard)
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
      Logger.error(error);
      if (error.name === "TypeError") throw new HttpException(error.message, 500);
      return res.status(error.status || 500).json(error);
    }
  }

  @Put(ACCOUNT_ROUTE.TRANSACTION_PIN)
  @UseGuards(StrictAuthGuard)
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
      Logger.error(error);
      Logger.error(error);
      if (error.name === "TypeError") throw new HttpException(error.message, 500);
      return res.status(error.status || 500).json(error);
    }
  }
}
