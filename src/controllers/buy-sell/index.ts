import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  Version,
} from "@nestjs/common";
import { Request, Response } from "express";
import { ICreateSwap, SwapDto } from "src/core/dtos/trade/swap.dto";
import { SwapServices } from "src/services/use-cases/trade/swap/swap-services.services";
import { isAuthenticated } from "src/core/decorators";
import { FeatureEnum } from "src/core/dtos/activity";
import { FeatureManagement,
  //  IsLevelTwo
   } from "src/decorator";

@Controller('/trade')
export class BuySellController {
  constructor(
    private swapServices: SwapServices,
  ) { }


  @FeatureManagement(FeatureEnum.SWAP)
  @isAuthenticated('strict')
  // @IsLevelTwo('two')
  @Post('/swap')
  async swap(@Req() req: Request, @Res() res: Response, @Body() body: SwapDto) {
    try {
      const userId = req?.user?._id;
      const response = await this.swapServices.swap(body, userId);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }


  @isAuthenticated('strict')
  // @IsLevelTwo('two')
  @FeatureManagement(FeatureEnum.SWAP)
  @Version('2')
  @Post('/swap')
  async swapV2(@Req() req: Request, @Res() res: Response, @Body() body: SwapDto) {
    try {
      const user = req?.user
      const payload: ICreateSwap = {
        ...body,
        userId: user._id,
        email: user.email
      }
      const response = await this.swapServices.swapV2(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

}
