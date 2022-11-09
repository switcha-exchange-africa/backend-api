import { Controller, Get, Param, Query, Res } from "@nestjs/common";
import { Response } from "express"
import { isAdminAuthenticated } from "src/core/decorators";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";
import { IGetWallets } from "src/core/dtos/wallet/wallet.dto";
import { WalletServices } from "src/services/use-cases/wallet/wallet-services.services";

@Controller('admin/wallets')
export class AdminWalletsController {

  constructor(private services: WalletServices) { }


  @isAdminAuthenticated('strict')
  @Get('/')
  async findAll(@Res() res: Response, @Query() query) {
    try {
      const { perpage, page, dateFrom, dateTo, sortBy, orderBy, userId, coin, reference, q } = query
      const payload: IGetWallets = {
        perpage,
        page,
        q,
        dateFrom,
        dateTo,
        sortBy,
        orderBy,
        userId,
        coin,
        reference,
        isAdmin: true
      }
      const response = await this.services.findAll(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @isAdminAuthenticated('strict')
  @Get('/:id')
  async detail(@Res() res: Response, @Param() param: FindByIdDto) {
    try {
      const { id } = param;
      const response = await this.services.details(id);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

}