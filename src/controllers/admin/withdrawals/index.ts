import { Controller, Get, Param, Put, Query, Req, Res } from "@nestjs/common";
import { Response, Request } from "express"
import { isAdminAuthenticated } from "src/core/decorators";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";
import { IGetWithdrawals } from "src/core/entities/Withdrawal";
import { WithdrawalServices } from "src/services/use-cases/withdrawal/withdrawal.service";

@Controller('admin/withdrawals')
export class AdminWithdrawalController {

  constructor(private services: WithdrawalServices) { }


  @Get('/')
  @isAdminAuthenticated('strict')
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
  @isAdminAuthenticated('strict')
  async getSingleWithdrawal(@Res() res: Response, @Param() param: FindByIdDto) {
    try {
      const { id } = param;
      const response = await this.services.getSingleWithdrawal(id);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Put('/:id/approve')
  @isAdminAuthenticated('strict')
  async approveWithdrawal(@Req() req: Request, @Res() res: Response, @Param() param: FindByIdDto) {
    try {
      const { email } = req.user
      const { id: withdrawalId } = param;
      const payload = {
        withdrawalId,
        email
      }
      const response = await this.services.approveWithdrawals(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Put('/:id/deny')
  @isAdminAuthenticated('strict')
  async denyWithdrawal(@Req() req: Request, @Res() res: Response, @Param() param: FindByIdDto) {
    try {
      const { email } = req.user
      const { id: withdrawalId } = param;
      const payload = {
        withdrawalId,
        email
      }
      const response = await this.services.denyWithdrawal(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

}