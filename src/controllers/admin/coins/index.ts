import { Body, Controller, Get, Param, Post, Query, Req, Res } from "@nestjs/common";
import { Response, Request } from "express"
import { isAdminAuthenticated } from "src/core/decorators";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";
import { AddCoinDto } from "src/core/dtos/coin";
import { ByPass } from "src/decorator";
import { CoinServices } from "src/services/use-cases/coins/coin.service";

@Controller('admin/coins')
export class AdminCoinController {

  constructor(private services: CoinServices) { }


  @Post('/')
  @isAdminAuthenticated('strict')
  @ByPass('pass')
  async seed(@Req() req: Request, @Res() res: Response) {
    try {

      const userId = req?.user?._id
      const response = await this.services.seed(userId);

      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @isAdminAuthenticated('strict')
  @Post('/add')
  @ByPass('pass')
  async addCoin(@Req() req: Request, @Body() body: AddCoinDto, @Res() res: Response) {
    try {

      const userId = req?.user?._id
      const response = await this.services.addCoin({ ...body, userId });

      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Get('/')
  @isAdminAuthenticated('strict')
  async getAllCoins(@Res() res: Response, @Query() query) {
    try {

      const { perpage, page, dateFrom, dateTo, sortBy, orderBy, coin, type } = query
      const response = await this.services.getAllCoins({
        perpage, page, dateFrom, dateTo, sortBy, orderBy, coin, type
      });

      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Get('/:id')
  @isAdminAuthenticated('strict')
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