import { StrictAuthGuard } from "src/middleware-guards/auth-guard.middleware";
import {
  Body,
  Controller,
  Get,
  HttpException,
  Logger,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";

import { Request, Response } from "express";
import { TRANSACTION_ROUTE } from "src/lib/constants";
import { TransactionServices } from "src/services/use-cases/transaction/transaction-services.services";

@Controller()
export class TransactionController {
  constructor(private transactionServices: TransactionServices) {}
  @Get(TRANSACTION_ROUTE.GET)
  @UseGuards(StrictAuthGuard)
  async findAll(@Req() req: Request, @Res() res: Response) {
    try {
      const userId = req?.user?._id;
      const response = await this.transactionServices.findAll(userId);
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }

  
  @Get(TRANSACTION_ROUTE.GET_SINGLE)
  @UseGuards(StrictAuthGuard)
  async detail(
    @Req() req: Request,
    @Res() res: Response,
    @Param() param: { transactionId }
  ) {
    try {
      const { transactionId } = param;
      const response = await this.transactionServices.details(transactionId);
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }

}
