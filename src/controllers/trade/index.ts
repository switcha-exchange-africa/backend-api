import { StrictAuthGuard } from "src/middleware-guards/auth-guard.middleware";
import {
  Body,
  Controller,
  HttpException,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";

import { Request, Response } from "express";
import { TRADE_ROUTE } from "src/lib/constants";
import { BuySellDto } from "src/core/dtos/trade/buysell.dto";
import { BuySellServices } from "src/services/use-cases/trade/buysell-services.services";

@Controller()
export class TradeController {
  constructor(private buySellServices: BuySellServices) {}

  @Post(TRADE_ROUTE.BUY)
  @UseGuards(StrictAuthGuard)
  async buy(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: BuySellDto
  ) {
    try {
      const userId = req?.user?._id;
      const response = await this.buySellServices.buy(body, userId);
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }

  @Post(TRADE_ROUTE.SELL)
  @UseGuards(StrictAuthGuard)
  async sell(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: BuySellDto
  ) {
    try {
      const userId = req?.user?._id;
      const response = await this.buySellServices.sell(body, userId);
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }

  //   @Post(TRADE_ROUTE.SWAP)
  //   async swap(
  //     @Req() req: Request,
  //     @Res() res: Response,
  //     @Body() body: SwapDto
  //   ) {
  //     try {
  //         const userId = req?.user?._id;
  //         // const response = await this.buySellServices.swap(body, userId);
  //         // return res.status(response.status).json(response);
  //       } catch (error) {
  //         Logger.error(error);
  //         if (error.name === "TypeError")
  //           throw new HttpException(error.message, 500);
  //         throw new HttpException(error.message, 500);
  //       }
  //   }
}
