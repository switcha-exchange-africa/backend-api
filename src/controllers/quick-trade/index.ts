import {
  Body,
  Controller,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import { Request, Response } from "express";
import { QuickTradeServices } from "src/services/use-cases/trade/quick-trade/quick-trade-services.services";
import { IQuickTradeBuyV2, QuickTradeBuySellV2Dto } from "src/core/dtos/trade/quick-trade.dto";
import { isAuthenticated } from "src/core/decorators";

@Controller('/trade/quick-trade')
export class QuickTradeController {
  constructor(
    private quickTradeServices: QuickTradeServices,
  ) { }

  // @Post(TRADE_ROUTE.QUICK_TRADE_BUY)
  // @isAuthenticated('strict')
  // async buyAd(
  //   @Req() req: Request,
  //   @Res() res: Response,
  //   @Body() body: QuickTradeBuyDto
  // ) {
  //   try {
  //     const user = req?.user!
  //     const userId = user._id

  //     const payload: IQuickTradeBuy = {
  //       userId,
  //       fullName: user.fullName,
  //       ...body
  //     }

  //     const response = await this.quickTradeServices.buyAd(payload);
  //     return res.status(response.status).json(response);

  //   } catch (error) {
  //     return res.status(error.status || 500).json(error);

  //   }
  // }

  // @Get(TRADE_ROUTE.QUICK_TRADE_BUY)
  // @isAuthenticated('strict')
  // async getBuyAds(
  //   @Req() req: Request,
  //   @Res() res: Response,
  //   @Query() query: any
  // ) {
  //   try {

  //     const userId = req?.user?._id;
  //     const { perpage, page, dateFrom, dateTo, sortBy, orderBy } = query

  //     const response = await this.quickTradeServices.getBuyAds({ perpage, page, dateFrom, dateTo, sortBy, orderBy, userId });
  //     return res.status(response.status).json(response);

  //   } catch (error) {
  //     return res.status(error.status || 500).json(error);

  //   }
  // }

  // @Post(TRADE_ROUTE.QUICK_TRADE_SELL)
  // @isAuthenticated('strict')
  // async sell(
  //   @Req() req: Request,
  //   @Res() res: Response,
  //   @Body() body: QuickTradeSellDto
  // ) {
  //   try {

  //     const user = req?.user!
  //     const userId = user._id

  //     const payload: IQuickTradeSell = {
  //       userId,
  //       fullName: user.fullName,
  //       ...body
  //     }

  //     const response = await this.quickTradeServices.sell(payload);
  //     return res.status(response.status).json(response);


  //   } catch (error) {
  //     return res.status(error.status || 500).json(error);

  //   }
  // }


  @isAuthenticated('strict')
  @Post('/')
  async buy(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: QuickTradeBuySellV2Dto
  ) {
    try {
      const user = req?.user!
      const userId = user._id

      const payload: IQuickTradeBuyV2 = {
        userId,
        email: user.email,
        ...body
      }

      const response = await this.quickTradeServices.buyV2(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }



}



