import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
} from "@nestjs/common";

import { Request, Response } from "express";
import { ICreateWithdrawal, WithdrawalCreateDto } from "src/core/dtos/withdrawal";
import { WithdrawalServices } from "src/services/use-cases/withdrawal/withdrawal.service";
import { IGetWithdrawals } from "src/core/entities/Withdrawal";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";
import { isAuthenticated } from "src/core/decorators";

@Controller('/withdrawal')
export class WithdrawalController {

  constructor(private services: WithdrawalServices) { }

  @Post('/crypto')
  @isAuthenticated('strict')
  async createCryptoWithdrawalManual(
    @Req() req: Request,
    @Body() body: WithdrawalCreateDto,
    @Res() res: Response) {
    try {

      const userId = req?.user._id
      const payload: ICreateWithdrawal = { ...body, userId, email: req?.user.email }
      const response = await this.services.createCryptoWithdrawalManual(payload)
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }


  @Get('/')
  @isAuthenticated('strict')
  async getWithdrawals(
    @Req() req: Request,
    @Query() query: any,
    @Res() res: Response) {
    try {
      const userId = req?.user?._id
      const { perpage, page, dateFrom, dateTo, sortBy, orderBy, transactionId, walletId, bankId, processedBy, currency, reference, type, subType, paymentMethod, status } = query

      const payload: IGetWithdrawals = {
        userId, perpage, page, dateFrom, dateTo, sortBy, orderBy,
        transactionId, walletId, bankId, processedBy, currency, reference, type, subType, paymentMethod, status

      }
      const response = await this.services.getWithdrawals(payload)
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Get('/:id')
  @isAuthenticated('strict')
  async getSingleWithdrawal(
    @Req() req: Request,
    @Param() params: FindByIdDto,
    @Res() res: Response) {
    try {
      const userId = req?.user?._id
      const { id } = params
      const payload = { userId, id }

      const response = await this.services.getSingleWithdrawal(payload)
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Put('/:id')
  @isAuthenticated('strict')
  async cancelWithdrawal(
    @Req() req: Request,
    @Param() params: FindByIdDto,
    @Res() res: Response) {
    try {
      const userId = req?.user?._id
      const { id } = params
      const payload = { userId, id, email: req?.user?.email }

      const response = await this.services.cancelWithdrawal(payload)
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }
}
