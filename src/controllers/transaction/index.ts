import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import { Request, Response } from "express";
import { TransactionServices } from "src/services/use-cases/transaction/transaction-services.services";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";
import { IGetTransactions } from "src/core/dtos/transactions";
import { isAuthenticated } from "src/core/decorators";

@Controller('transactions')
export class TransactionController {
  constructor(private transactionServices: TransactionServices) { }
  @isAuthenticated('strict')
  @Get('/')
  async findAll(@Req() req: Request, @Query() query: any, @Res() res: Response) {
    try {

      const userId = req?.user?._id!;
      const { perpage, page, dateFrom, dateTo, sortBy, orderBy, hash, accountId, customTransactionType, subType, status, walletId, currency, tatumTransactionId, reference, generalTransactionReference, senderAddress, type } = query

      const payload: IGetTransactions = {
        perpage, userId, page, dateFrom, dateTo, sortBy, orderBy, hash, accountId, customTransactionType, subType, status, walletId, currency, tatumTransactionId, reference, generalTransactionReference, senderAddress, type
      }
      const response = await this.transactionServices.getAllTransactions(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }


  @isAuthenticated('strict')
  @Get('/:id')
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
