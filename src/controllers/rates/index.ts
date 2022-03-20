import {
  Body,
  Controller,
  Get,
  HttpException,
  Logger,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { RATES_ROUTE } from "src/lib/constants";
import { RatesServices } from "src/services/use-cases/rates/rates-services.services";
import { Request, Response } from "express";

@Controller()
export class RatesController {
  constructor(private rateServices: RatesServices) {}

  @Get(RATES_ROUTE.PRICES)
  async findAll(@Req() req: Request, @Res() res: Response) {
    try {
      const response = await this.rateServices.findAll();
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }

  @Get(RATES_ROUTE.SINGLE_PRICES)
  async single(
    @Req() req: Request,
    @Res() res: Response,
    @Param() param: { asset: string }
  ) {
    const { asset } = param;
    try {
      const response = await this.rateServices.findOne(asset);
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }
}
