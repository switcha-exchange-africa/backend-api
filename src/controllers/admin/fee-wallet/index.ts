import { Controller, Get, Param, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { Response, Request } from "express"
import { StrictAuthGuard } from "src/middleware-guards/auth-guard.middleware";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";
import { FeeWalletServices } from "src/services/use-cases/fee-wallet/fee-wallet.service";

@Controller('admin/fee-wallets')
export class AdminFeeWalletsController {

  constructor(private services: FeeWalletServices) { }


  @Post('/')
  @UseGuards(StrictAuthGuard)
  async seedWallets(@Req() req: Request, @Res() res: Response) {
    try {
      
      const userId = req?.user?._id
      const response = await this.services.seedWallets(userId);

      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }
  @Get('/')
  @UseGuards(StrictAuthGuard)
  async getAllWallets(@Res() res: Response, @Query() query) {
    try {

      const { perpage, page, dateFrom, dateTo, sortBy, orderBy, userId, coin, reference } = query
      const response = await this.services.getAllWallets({ perpage, page, dateFrom, dateTo, sortBy, orderBy, userId, coin, reference });

      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Get('/:id')
  @UseGuards(StrictAuthGuard)
  async getSingleWallet(@Res() res: Response, @Param() param: FindByIdDto) {
    try {

      const { id } = param;
      const response = await this.services.getSingleWallet(id);

      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

}