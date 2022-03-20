import { FundDto } from "./../../core/dtos/wallet/fund.dto";
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
  constructor(private walletServices: WalletServices) { }

  @Post(WALLET_ROUTE.ROUTE)
  @UseGuards(StrictAuthGuard)
  async create(@Req() req: Request, @Res() res: Response) {
    try {
      const userId = req?.user?._id;
      await this.walletServices.create(userId);
      return res.status(201).json("Wallet Created Successfully");
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }

  @Get(WALLET_ROUTE.ROUTE)
  @UseGuards(StrictAuthGuard)
  async findAll(@Req() req: Request, @Res() res: Response, @Query() query) {
    try {
      const userId = req?.user?._id;
      const response = await this.walletServices.findAll(query, userId);
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }

  @Get(WALLET_ROUTE.SINGLE_ROUTE)
  @UseGuards(StrictAuthGuard)
  async detail(
    @Res() res: Response,
    @Param() param: { id }
  ) {
    try {
      const { id } = param;
      const response = await this.walletServices.details(id);
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }

  @Post(WALLET_ROUTE.SINGLE_ROUTE)
  @UseGuards(StrictAuthGuard)
  async fund(@Req() req: Request, @Res() res: Response, @Body() body: FundDto) {
    try {
      const userId = req?.user?._id
      const response = await this.walletServices.fund(body, userId);
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }
}
