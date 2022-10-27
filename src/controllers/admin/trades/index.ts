import { Controller, Get, Param, Query, Res } from "@nestjs/common";
import { Response } from "express"
import { isAuthenticated } from "src/core/decorators";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";
import { IGetP2pOrders } from "src/core/dtos/p2p";
import { P2pServices } from "src/services/use-cases/trade/p2p/p2p.service";

@Controller('admin/trades')
export class AdminTradesController {

  constructor(private services: P2pServices) { }


  @Get('/')
  @isAuthenticated('strict')
  async getAllTrades(@Res() res: Response, @Query() query) {
    try {
      const {
        perpage,
        page,
        dateFrom,
        dateTo,
        sortBy,
        orderBy,
        merchantId,
        clientId,
        adId,
        clientWalletId,
        type,
        status,
        orderId,
        bankId,
        method,
        q
      } = query
      const payload: IGetP2pOrders = {
        perpage,
        page,
        dateFrom,
        dateTo,
        sortBy,
        orderBy,
        merchantId,
        clientId,
        adId,
        clientWalletId,
        type,
        status,
        orderId,
        bankId,
        method,
        q
      }
      const response = await this.services.getP2pOrders(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Get('/:id')
  @isAuthenticated('strict')
  async getSingleTrade(@Res() res: Response, @Param() param: FindByIdDto) {
    try {
      const { id } = param;
      const response = await this.services.getSingleP2pOrder(id);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

}