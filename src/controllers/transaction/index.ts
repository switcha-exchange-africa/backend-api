import { StrictAuthGuard } from "src/middleware-guards/auth-guard.middleware";
import {
  Controller,
  Get,
  HttpException,
  Logger,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";

import { Request, Response } from "express";
import { TRANSACTION_ROUTE } from "src/lib/route-constant";
import { TransactionServices } from "src/services/use-cases/transaction/transaction-services.services";

@Controller()
export class TransactionController {
  constructor(private transactionServices: TransactionServices) { }
  @Get(TRANSACTION_ROUTE.GET)
  @UseGuards(StrictAuthGuard)
  async findAll(@Req() req: Request, @Query() query: any, @Res() res: Response) {
    try {
      const userId = req?.user?._id;
      const response = await this.transactionServices.findAll(query, userId);
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
    @Res() res: Response,
    @Param() param: { id }
  ) {
    try {
      const { id } = param;
      const response = await this.transactionServices.details(id);
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }

}
