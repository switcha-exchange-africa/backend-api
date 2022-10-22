import { Body, Controller, Get, Post, Req, Res, Query, Param } from "@nestjs/common";
import { Response, Request } from "express"
import { CreateExchangeRateDto, FindByCoinDto, ICreateExchangeRate, IGetExchangeRates } from "src/core/dtos/rates/rates.dto";
import { ExchangeRateServices } from "src/services/use-cases/exchange-rates/exchange-rates.service";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";
import { isAuthenticated } from "src/core/decorators";
import { ByPass } from "src/decorator";

@Controller('admin/exchange-rates')
export class AdminExchangeRatesController {

  constructor(private services: ExchangeRateServices) { }



  @Post('/')
  @isAuthenticated('strict')
  @ByPass('pass')
  async createExchangeRate(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateExchangeRateDto
  ) {
    try {
      const userId = req?.user._id
      const payload: ICreateExchangeRate = {
        ...body,
        userId
      }
      const response = await this.services.createExchangeRate(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Get('/')
  @isAuthenticated('strict')
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
  @isAuthenticated('strict')
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
  @isAuthenticated('strict')
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
}