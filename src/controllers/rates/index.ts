import {
  Controller,
  Get,
  HttpException,
  Logger,
  Param,
  Res,
} from "@nestjs/common";
import { RATES_ROUTE } from "src/lib/constants";
import { RatesServices } from "src/services/use-cases/rates/rates-services.services";
import { Response } from "express";

@Controller()
export class RatesController {
  constructor(private rateServices: RatesServices) {}

  @Get(RATES_ROUTE.PRICES)
  async findAll(@Res() res: Response) {
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

  @Get(RATES_ROUTE.MARKETS)
  async allMarketCharts(@Res() res: Response) {
    try {
      const response = await this.rateServices.allCryptoMarketCharts();
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }

  @Get(RATES_ROUTE.MARKETS_SINGLE)
  async marketCharts(
    @Res() res: Response,
    @Param()
    param: { coin: string; baseCurrency: string; pricePercentage: string }
  ) {
    try {
      const { coin, baseCurrency, pricePercentage } = param;
      const response = await this.rateServices.cryptoMarketCharts(
        baseCurrency,
        coin,
        pricePercentage
      );
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }
  @Get(RATES_ROUTE.HISTORICAL_MARKETS_DATA)
  async cryptoPrices(
    @Res() res: Response,
    @Param()
    param: {
      coin: string;
      baseCurrency: string;
      days: string;
      interval: string;
    }
  ) {
    const { coin, baseCurrency, days, interval } = param;
    try {
      const response = await this.rateServices.cryptoPrices(
        baseCurrency,
        coin,
        days,
        interval
      );
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }

  @Get(RATES_ROUTE.SINGLE_PRICES)
  async single(@Res() res: Response, @Param() param: { asset: string }) {
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
