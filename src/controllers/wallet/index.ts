import { WalletServices } from "src/services/use-cases/wallet/wallet-services.services";
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
} from "@nestjs/common";

import { WALLET_ROUTE } from "src/lib/route-constant";

import { Request, Response } from "express";
import { CreateWalletDto, IGetSingleWallet, IGetWallets } from "src/core/dtos/wallet/wallet.dto";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";
import { isAuthenticated } from "src/core/decorators";

@Controller()
export class WalletController {
  constructor(
    private services: WalletServices,
  ) { }

  @Post(WALLET_ROUTE.ROUTE)
  @isAuthenticated('strict')
  async create(@Req() req: Request, @Body() body: CreateWalletDto, @Res() res: Response) {
    try {
      const user = req?.user!
      const userId = user._id

      const { coin } = body
      const response = await this.services.create({ userId, coin, email: user.email, fullName: `${user.firstName} ${user.lastName}` })

      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Get(WALLET_ROUTE.ROUTE)
  @isAuthenticated('strict')
  async findAll(@Req() req: Request, @Res() res: Response, @Query() query) {
    try {

      const userId = req?.user?._id;
      const { perpage, page, dateFrom, dateTo, sortBy, orderBy, coin, reference } = query

      const payload: IGetWallets = { perpage, page, dateFrom, dateTo, sortBy, orderBy, userId, coin, reference, email: req?.user?.email, fullName: `${req?.user?.firstName} ${req?.user?.lastName}` }
      const response = await this.services.findAll(payload);

      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Get(WALLET_ROUTE.SINGLE_ROUTE)
  @isAuthenticated('strict')
  async detail(@Req() req: Request, @Res() res: Response, @Param() param: FindByIdDto) {
    try {
      const { email } = req.user
      const { id } = param;
      const payload: IGetSingleWallet = { email, id }
      const response = await this.services.details(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

}
