import { WalletDto } from "src/core/dtos/wallet/wallet.dto";
import { WalletServices } from "src/services/use-cases/wallet/wallet-services.services";
import {
  Body,
  Controller,
  Get,
  HttpException,
  Logger,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";

import { WALLET_ROUTE } from "src/lib/constants";
import { StrictAuthGuard } from "src/middleware-guards/auth-guard.middleware";

import { Request, Response } from "express";

@Controller()
export class WalletController {
  constructor(private walletServices: WalletServices) {}

  @Post(WALLET_ROUTE.POST)
  @UseGuards(StrictAuthGuard)
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body
  ) {
    try {
      const userId = req?.user?._id;
      // const {network, coinType} = body
      await this.walletServices.create(userId);
      return res.status(201).json("Wallet Created Successfully");
    } catch (error) {
      if (error.name === "TypeError") {
        Logger.error(error);
        throw new HttpException(error.message, 500);
      }
      Logger.error(error);
      return res.status(error.status || 500).json(error);
    }
  }

  @Get(WALLET_ROUTE.GET)
  @UseGuards(StrictAuthGuard)
  async findAll(@Req() req: Request, @Res() res: Response) {
    try {
      const userId = req?.user?._id;
      const response = await this.walletServices.findAll(userId);
      return res.send(response);
    } catch (error) {
      if (error.name === "TypeError") {
        Logger.error(error);
        throw new HttpException(error.message, 500);
      }
      Logger.error(error);
      return res.status(error.status || 500).json(error);
    }
  }

  @Get(WALLET_ROUTE.GET_SINGLE)
  @UseGuards(StrictAuthGuard)
  async detail(
    @Req() req: Request,
    @Res() res: Response,
    @Param() param: { walletId }
  ) {
    try {
      const userId = req?.user?._id;
      const { walletId } = param;
      const response = await this.walletServices.details(walletId);
      return res.send(response);
    } catch (error) {
      if (error.name === "TypeError") {
        Logger.error(error);
        throw new HttpException(error.message, 500);
      }
      Logger.error(error);
      return res.status(error.status || 500).json(error);
    }
  }
}
