import { Controller, Get, Param, Post, Query, Req, Res } from "@nestjs/common";
import { Response, Request } from "express"
import { isAuthenticated } from "src/core/decorators";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";
import { CoinServices } from "src/services/use-cases/coins/coin.service";

@Controller('admin/coins')
export class AdminCoinController {

  constructor(private services: CoinServices) { }


  @Post('/')
  @isAuthenticated('strict')
  async seed(@Req() req: Request, @Res() res: Response) {
    try {

      const userId = req?.user?._id
      const response = await this.services.seed(userId);

      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }
  @Get('/')
  @isAuthenticated('strict')
  async getAllCoins(@Res() res: Response, @Query() query) {
    try {

      const { perpage, page, dateFrom, dateTo, sortBy, orderBy, coin } = query
      const response = await this.services.getAllCoins({
        perpage, page, dateFrom, dateTo, sortBy, orderBy, coin,
      });

      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Get('/:id')
  @isAuthenticated('strict')
  async getSingleCoin(@Res() res: Response, @Param() param: FindByIdDto) {
    try {

      const { id } = param;
      const response = await this.services.getSingleCoin(id);

      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

}