import { Controller, Get, Param, Post, Query, Req, Res } from "@nestjs/common";
import { Response, Request } from "express"
import { isAdminAuthenticated } from "src/core/decorators";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";
import { IGetP2pOrders, IP2pConfirmOrderAdmin } from "src/core/dtos/p2p";
import { P2pServices } from "src/services/use-cases/trade/p2p/p2p.service";

@Controller('admin/trades')
export class AdminTradesController {

  constructor(private services: P2pServices) { }


  @Get('/')
  @isAdminAuthenticated('strict')
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
        coin,
        cash,
        orderType,
        q
      } = query
      const payload: IGetP2pOrders = {
        perpage,
        page,
        dateFrom,
        dateTo,
        sortBy,
        orderBy,
        orderType,
        merchantId,
        clientId,
        adId,
        clientWalletId,
        type,
        status,
        orderId,
        bankId,
        method,
        coin,
        cash,
        q
      }
      const response = await this.services.getP2pOrders(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Get('/:id')
  @isAdminAuthenticated('strict')
  async getSingleTrade(@Res() res: Response, @Param() param: FindByIdDto) {
    try {
      const { id } = param;
      const response = await this.services.getSingleP2pOrder(id);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Post('/:id/release')
  @isAdminAuthenticated('strict')
  async confirmP2pOrder(
    @Req() req: Request,
    @Res() res: Response,
    @Param() params: FindByIdDto

  ) {
    try {
      const { id } = params
      const payload: IP2pConfirmOrderAdmin = {
        orderId: id,
        processedByAdminId: req?.user?._id
      }

      const response = await this.services.confirmP2pOrderAdmin(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }
}