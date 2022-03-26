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
import { BuySellDto } from "src/core/dtos/trade/buy-sell.dto";
import { BuySellServices } from "src/services/use-cases/trade/buy-sell-services.services";
import { SwapDto } from "src/core/dtos/trade/swap.dto";
import { SwapServices } from "src/services/use-cases/trade/swap/swap-services.services";

@Controller()
export class TradeController {
  constructor(
    private buySellServices: BuySellServices,
    private swapServices: SwapServices
  ) {}

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

  @Post(TRADE_ROUTE.SWAP)
  @UseGuards(StrictAuthGuard)
  async swap(@Req() req: Request, @Res() res: Response, @Body() body: SwapDto) {
    try {
      const userId = req?.user?._id;
      const response = await this.swapServices.swap(body, userId);
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }
}
