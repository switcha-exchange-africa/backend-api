import {
  Controller,
  Get,
  HttpException,
  Logger,
  Param,
  Query,
  Res,
} from "@nestjs/common";
import { RATES_ROUTE } from "src/lib/constants";
import { RatesServices } from "src/services/use-cases/rates/rates-services.services";
import { Response } from "express";
import { HistoricDataDto } from "src/core/dtos/rates/rates.dto";

@Controller()
export class RatesController {
  constructor(private rateServices: RatesServices) { }

  @Get(RATES_ROUTE.PRICES)
  async findAll(@Res() res: Response) {
    try {
      const response = await this.rateServices.findAll();
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError") throw new HttpException(error.message, 500);
      return res.status(error.status || 500).json(error);
    }
  }

  @Get(RATES_ROUTE.MARKETS)
  async allMarketCharts(@Res() res: Response) {
    try {
      const response = await this.rateServices.allCryptoMarketCharts();
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError") throw new HttpException(error.message, 500);
      return res.status(error.status || 500).json(error);
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
      if (error.name === "TypeError") throw new HttpException(error.message, 500);
      return res.status(error.status || 500).json(error);
    }
  }
  @Get(RATES_ROUTE.HISTORICAL_MARKETS_DATA)
  async cryptoPrices(
    @Res() res: Response,
    @Query() query: HistoricDataDto
  ) {
    const { coin, base, days, interval } = query;
    try {
      const response = await this.rateServices.cryptoPrices({
        base,
        coin,
        days,
        interval
      });
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError") throw new HttpException(error.message, 500);
      return res.status(error.status || 500).json(error);
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
      if (error.name === "TypeError") throw new HttpException(error.message, 500);
      return res.status(error.status || 500).json(error);
    }
  }
  
  @Get(RATES_ROUTE.EXCHANGE_RATE)
  async exchangeRate(@Res() res: Response, @Query() query: any) {
    const { coin, base } = query;
    try {
      const response = await this.rateServices.exchangeRate(coin, base);
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError") throw new HttpException(error.message, 500);
      return res.status(error.status || 500).json(error);
    }
  }
}
