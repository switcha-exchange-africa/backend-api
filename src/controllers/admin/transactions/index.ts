import { Controller, Get, Param, Query, Res, UseGuards } from "@nestjs/common";
import { TransactionServices } from "src/services/use-cases/transaction/transaction-services.services";
import { Response } from "express"
import { StrictAuthGuard } from "src/middleware-guards/auth-guard.middleware";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";
import { IGetTransactions } from "src/core/dtos/transactions";

@Controller('admin/transactions')
export class AdminTransactionsController {

  constructor(private services: TransactionServices) { }

  @Get("/")
  @UseGuards(StrictAuthGuard)
  async findAll(@Query() query: any, @Res() res: Response) {
    try {

      const { userId, perpage, page, dateFrom, dateTo, sortBy, orderBy, hash, customTransactionType, subType, status, walletId, currency, tatumTransactionId, reference, generalTransactionReference, senderAddress, type } = query

      const payload: IGetTransactions = {
        perpage, userId, page, dateFrom, dateTo, sortBy, orderBy, hash, customTransactionType, subType, status, walletId, currency, tatumTransactionId, reference, generalTransactionReference, senderAddress, type
      }
      const response = await this.services.getAllTransactions(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }


  @Get('/:id')
  @UseGuards(StrictAuthGuard)
  async getSingleTransaction(
    @Res() res: Response,
    @Param() param: FindByIdDto
  ) {
    try {
      const { id } = param;
      const response = await this.services.getSingleTransaction(id);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }
}