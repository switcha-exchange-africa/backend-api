import { Controller, Get, Param, Query, Res } from "@nestjs/common";
import { Response } from "express"
import { isAuthenticated } from "src/core/decorators";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";
import { IGetWithdrawals } from "src/core/entities/Withdrawal";
import { WithdrawalServices } from "src/services/use-cases/withdrawal/withdrawal.service";

@Controller('admin/withdrawals')
export class AdminWithdrawalController {

  constructor(private services: WithdrawalServices) { }


  @Get('/')
  @isAuthenticated('strict')
  async getAllWithdrawals(@Res() res: Response, @Query() query) {
    try {
      const {
        perpage,
        page,
        dateFrom,
        dateTo,
        sortBy,
        orderBy,
        userId,
        transactionId,
        walletId,
        bankId,
        processedBy,
        currency,
        reference,
        type,
        subType,
        paymentMethod,
        status,
        q
      } = query
      const payload: IGetWithdrawals = {
        perpage,
        page,
        dateFrom,
        dateTo,
        sortBy,
        orderBy,
        userId,
        transactionId,
        walletId,
        bankId,
        processedBy,
        currency,
        reference,
        type,
        subType,
        paymentMethod,
        status,
        q
      }
      const response = await this.services.getWithdrawals(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Get('/:id')
  @isAuthenticated('strict')
  async getSingleWithdrawal(@Res() res: Response, @Param() param: FindByIdDto) {
    try {
      const { id } = param;
      const response = await this.services.getSingleWithdrawal(id);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

}