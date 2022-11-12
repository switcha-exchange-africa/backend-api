import {
  Controller,
  Get,
  Query,
  Res,
} from "@nestjs/common";
import { RatesServices } from "src/services/use-cases/rates/rates-services.services";
import { Response } from "express";
import { ISwapV2, SwapV2Dto } from "src/core/dtos/trade/swap.dto";
import { SingleRateDto } from "src/core/dtos/rates/rates.dto";

@Controller('rates')
export class RatesController {
  constructor(private rateServices: RatesServices) { }

  @Get('/')
  async findAll(@Res() res: Response, @Query() query: any) {
    try {
      const base = query.base
      const response = await this.rateServices.findAll(base);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Get('/single')
  async getSingleRate(@Res() res: Response, @Query() query: SingleRateDto) {
    try {
      const { base, sub } = query
      const payload = { base, sub }
      const response = await this.rateServices.getSingleRate(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Get('/exchange')
  async exchangeRate(@Res() res: Response, @Query() query: SwapV2Dto) {
    try {
      const { source, destination, amount } = query
      const payload: ISwapV2 = { source, destination, amount }
      const response = await this.rateServices.convert(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }
}
