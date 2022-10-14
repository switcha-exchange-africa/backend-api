import { Controller, Get, Res, Query, Param } from "@nestjs/common";
import { Response } from "express"
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";
import { CoinServices } from "src/services/use-cases/coins/coin.service";
import { IGetCoins } from "src/core/entities/Coin";
import { isAuthenticated } from "src/core/decorators";

@Controller('coins')
export class CoinController {

  constructor(private services: CoinServices) { }


  @Get('/')
  @isAuthenticated('strict')
  async getAllCoins(
    @Res() res: Response,
    @Query() query: any
  ) {
    try {

      const { perpage, page, dateFrom, dateTo, sortBy, orderBy, userId, coin, type } = query
      const payload: IGetCoins = {
        perpage, userId, page, dateFrom, dateTo, sortBy, orderBy, type,
        coin
      }

      const response = await this.services.getAllCoins(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Get('/:id')
  @isAuthenticated('strict')
  async getSingleCoin(
    @Res() res: Response,
    @Param() params: FindByIdDto
  ) {
    try {

      const { id } = params
      const response = await this.services.getSingleCoin(id);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }




}