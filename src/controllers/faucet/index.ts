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
import { FaucetDto } from "src/core/dtos/wallet/faucet.dto";
import { FAUCET_ROUTE } from "src/lib/constants";
import { FaucetFactoryServices } from "src/services/use-cases/wallet/faucet/faucet-factory.services";
import { FaucetServices } from "src/services/use-cases/wallet/faucet/faucet-services.services";

import { Request, Response } from "express";
import { StrictAuthGuard } from "src/middleware-guards/auth-guard.middleware";

@Controller()
export class FaucetController {
  constructor(
    private faucetServices: FaucetServices,
    private faucetFatoryServices: FaucetFactoryServices
  ) {}

  @Post(FAUCET_ROUTE.FUND)
  @UseGuards(StrictAuthGuard)

  async fund(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: FaucetDto
  ) {
    try {
      const userId = req?.user?._id;
      const faucet = await this.faucetFatoryServices.create(body, userId);
      const response = await this.faucetServices.create(faucet);
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error)
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }
}
