import { Controller, Get, HttpException, Logger, Param, Query, Res } from "@nestjs/common";
import { Response } from "express"
import { isAuthenticated } from "src/core/decorators";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";
import { WalletServices } from "src/services/use-cases/wallet/wallet-services.services";

@Controller('admin/wallets')
export class AdminWalletsController {

  constructor(private services: WalletServices) { }


  @Get('/')
  @isAuthenticated('strict')
  async findAll(@Res() res: Response, @Query() query) {
    try {
      const { perpage, page, dateFrom, dateTo, sortBy, orderBy, userId, coin, reference } = query

      const response = await this.services.findAll({ perpage, page, dateFrom, dateTo, sortBy, orderBy, userId, coin, reference });
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }

  @Get('/:id')
  @isAuthenticated('strict')
  async detail(@Res() res: Response, @Param() param: FindByIdDto) {
    try {
      const { id } = param;
      const response = await this.services.details(id);
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }

}