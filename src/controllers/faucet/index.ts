import {
  Body,
  Controller,
  HttpException,
  Logger,
  Post,
  Res,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  CreateFaucetDto,
  FundFaucetDto,
} from "src/core/dtos/wallet/faucet.dto";
import { FAUCET_ROUTE } from "src/lib/constants";

import { Response, Request } from "express";
import {
  BypassGuard,
  StrictAuthGuard,
} from "src/middleware-guards/auth-guard.middleware";
import { FaucetServices } from "src/services/use-cases/faucet/faucet-services.services";

@Controller()
export class FaucetController {
  constructor(private faucetServices: FaucetServices) {}

  @Post(FAUCET_ROUTE.ROUTE)
  @UseGuards(StrictAuthGuard)
  @UseGuards(BypassGuard)
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateFaucetDto
  ) {
    try {
      const userId = req?.user?._id;
      const response = await this.faucetServices.create({ ...body, userId });
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error.message);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      return res.status(error.status || 500).json(error.message);
    }
  }

  @Post(FAUCET_ROUTE.FUND)
  @UseGuards(StrictAuthGuard)
  @UseGuards(BypassGuard)
  async fund(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: FundFaucetDto
  ) {
    try {
      const userId = req?.user?._id;
      const response = await this.faucetServices.fund({ ...body, userId });
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error.message);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      return res.status(error.status || 500).json(error.message);
    }
  }
}
