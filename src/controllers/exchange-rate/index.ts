import { Controller, Get, Res, UseGuards, Query, Param } from "@nestjs/common";
import { Response } from "express"
import { StrictAuthGuard } from "src/middleware-guards/auth-guard.middleware";
import { FindByPairDto, IGetExchangeRates } from "src/core/dtos/rates/rates.dto";
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

      const { perpage, page, dateFrom, dateTo, sortBy, orderBy, userId, pair } = query
      const payload: IGetExchangeRates = {
        perpage, userId, page, dateFrom, dateTo, sortBy, orderBy,
        pair
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

  @Get('/rate/pair')
  @UseGuards(StrictAuthGuard)
  async getSingleExchangeRateByPair(
    @Res() res: Response,
    @Query() query: FindByPairDto
  ) {
    try {

      const { pair } = query
      const response = await this.services.getSingleExchangeRateByPair(pair);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }
}