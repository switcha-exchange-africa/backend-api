import { StrictAuthGuard } from "src/middleware-guards/auth-guard.middleware";
import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";

import { Request, Response } from "express";
import { TRANSACTION_ROUTE } from "src/lib/route-constant";
import { TransactionServices } from "src/services/use-cases/transaction/transaction-services.services";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";

@Controller()
export class TransactionController {
  constructor(private transactionServices: TransactionServices) { }
  @Get(TRANSACTION_ROUTE.GET)
  @UseGuards(StrictAuthGuard)
  async findAll(@Req() req: Request, @Query() query: any, @Res() res: Response) {
    try {

      const userId = req?.user?._id!;
      const { perpage, page, dateFrom, dateTo, sortBy, orderBy } = query

      const response = await this.transactionServices.getAllTransactions({ perpage, page, dateFrom, dateTo, sortBy, orderBy, userId });
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }


  @Get(TRANSACTION_ROUTE.GET_SINGLE)
  @UseGuards(StrictAuthGuard)
  async getSingleTransaction(
    @Res() res: Response,
    @Param() param: FindByIdDto
  ) {
    try {
      const { id } = param;
      const response = await this.transactionServices.getSingleTransaction(id);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

}
