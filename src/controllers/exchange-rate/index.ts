import { Controller, Get, Res, UseGuards, Query, Param } from "@nestjs/common";
import { Response } from "express"
import { StrictAuthGuard } from "src/middleware-guards/auth-guard.middleware";
import { ConvertByPairDto, FindByCoinDto, IConvertByPair, IGetExchangeRates } from "src/core/dtos/rates/rates.dto";
import { ExchangeRateServices } from "src/services/use-cases/exchange-rates/exchange-rates.service";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";

@Controller('exchange-rates')
export class ExchangeRatesController {

  constructor(private services: ExchangeRateServices) { }


  @Get('/')
  @UseGuards(StrictAuthGuard)
  async getAllExchangeRates(
    @Res() res: Response,
    @Query() query: any
  ) {
    try {

      const { perpage, page, dateFrom, dateTo, sortBy, orderBy, userId, coin } = query
      const payload: IGetExchangeRates = {
        perpage, userId, page, dateFrom, dateTo, sortBy, orderBy,
        coin
      }

      const response = await this.services.getAllExchangeRates(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Get('/:id')
  @UseGuards(StrictAuthGuard)
  async getSingleExchangeRate(
    @Res() res: Response,
    @Param() params: FindByIdDto
  ) {
    try {

      const { id } = params
      const response = await this.services.getSingleExchangeRate(id);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }


  @Get('/rate/coin')
  @UseGuards(StrictAuthGuard)
  async getSingleExchangeRateByCoin(
    @Res() res: Response,
    @Query() query: FindByCoinDto
  ) {
    try {

      const { coin } = query
      const response = await this.services.getSingleExchangeRateByCoin(coin);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }
  @Get('/rate/convert')
  @UseGuards(StrictAuthGuard)
  async convert(
    @Res() res: Response,
    @Query() query: ConvertByPairDto
  ) {
    try {

      const { amount, source, destination } = query
      const payload: IConvertByPair = { amount, source, destination }

      const response = await this.services.convert(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

}