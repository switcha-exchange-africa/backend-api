import { StrictAuthGuard } from "src/middleware-guards/auth-guard.middleware";
import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";

import { Request, Response } from "express";
import { TRADE_ROUTE } from "src/lib/route-constant";
import { BuySellDto } from "src/core/dtos/trade/buy-sell.dto";
import { BuySellServices } from "src/services/use-cases/trade/buy-sell/buy-sell-services.services";
import { SwapDto } from "src/core/dtos/trade/swap.dto";
import { SwapServices } from "src/services/use-cases/trade/swap/swap-services.services";
import { TransferDto } from "src/core/dtos/trade/transfer.dto";
import { TransferServices } from "src/services/use-cases/trade/transfer/transfer-services.services";

@Controller()
export class BuySellController {
  constructor(
    private buySellServices: BuySellServices,
    private swapServices: SwapServices,
    private transferServices: TransferServices
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
      return res.status(error.status || 500).json(error);
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
      return res.status(error.status || 500).json(error);

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
      return res.status(error.status || 500).json(error);
    }
  }

  @Post(TRADE_ROUTE.TRANSFER)
  @UseGuards(StrictAuthGuard)
  async transfer(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: TransferDto
  ) {
    try {
      const userId = req?.user?._id;
      const response = await this.transferServices.transfer(body, userId);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }
}
