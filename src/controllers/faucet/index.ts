import {
  Body,
  Controller,
  HttpException,
  Logger,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { FaucetDto } from "src/core/dtos/wallet/faucet.dto";
import { FAUCET_ROUTE } from "src/lib/constants";

import { Response } from "express";
import { StrictAuthGuard } from "src/middleware-guards/auth-guard.middleware";
import { FaucetServices } from "src/services/use-cases/faucet/faucet-services.services";

@Controller()
export class FaucetController {
  constructor(
    private faucetServices: FaucetServices,
  ) { }

  @Post(FAUCET_ROUTE.ROUTE)
  @UseGuards(StrictAuthGuard)

  async fund(
    @Res() res: Response,
    @Body() body: FaucetDto
  ) {
    try {
      const response = await this.faucetServices.create(body);
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error)
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }
}
