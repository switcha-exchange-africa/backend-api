import {
  Body,
  Controller,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import { Request, Response } from "express";
import { TRADE_ROUTE } from "src/lib/route-constant";
import { SwapDto } from "src/core/dtos/trade/swap.dto";
import { SwapServices } from "src/services/use-cases/trade/swap/swap-services.services";
import { isAuthenticated } from "src/core/decorators";
import { FeatureEnum } from "src/core/dtos/activity";
import { FeatureManagement } from "src/decorator";

@Controller()
export class BuySellController {
  constructor(
    private swapServices: SwapServices,
  ) {}


  @FeatureManagement(FeatureEnum.SWAP)
  @Post(TRADE_ROUTE.SWAP)
  @isAuthenticated('strict')
  async swap(@Req() req: Request, @Res() res: Response, @Body() body: SwapDto) {
    try {
      const userId = req?.user?._id;
      const response = await this.swapServices.swap(body, userId);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }


}
