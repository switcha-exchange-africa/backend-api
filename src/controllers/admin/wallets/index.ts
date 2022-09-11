import { Controller, Get, Param, Query, Res, UseGuards } from "@nestjs/common";
import { Response } from "express"
import { StrictAuthGuard } from "src/middleware-guards/auth-guard.middleware";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";
import { WalletServices } from "src/services/use-cases/wallet/wallet-services.services";

@Controller('admin/wallets')
export class AdminWalletsController {

  constructor(private services: WalletServices) { }


  @Get('/')
  @UseGuards(StrictAuthGuard)
  async findAll(@Res() res: Response, @Query() query) {
    try {
      const { perpage, page, dateFrom, dateTo, sortBy, orderBy, userId, coin } = query

      const response = await this.services.findAll({ perpage, page, dateFrom, dateTo, sortBy, orderBy, userId, coin });
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Get('/:id')
  @UseGuards(StrictAuthGuard)
  async detail(@Res() res: Response, @Param() param: FindByIdDto) {
    try {
      const { id } = param;
      const response = await this.services.details(id);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

}