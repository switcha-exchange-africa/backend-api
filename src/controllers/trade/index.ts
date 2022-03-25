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
import { TradeDto } from "src/core/dtos/trade/trade.dto";
import { TradeServices } from "src/services/use-cases/trade/trade-services.services";

@Controller()
export class TradeController {
  constructor(private tradeServices: TradeServices) {}

  @Post(TRADE_ROUTE.BUY)
  @UseGuards(StrictAuthGuard)
  async trade(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: TradeDto
  ) {
    try {
      const userId = req?.user?._id;
      const response = await this.tradeServices.withNgn(body, userId);
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }
}
