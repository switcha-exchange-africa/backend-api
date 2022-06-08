import { Body, Controller, Get, HttpException, HttpStatus, Logger, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { AddBankDto, IBank } from "src/core/dtos/bank";
import { BANK_ROUTE } from "src/lib/route-constant";
import { StrictAuthGuard } from "src/middleware-guards/auth-guard.middleware";
import { Request, Response } from 'express';
import { BankServices } from "src/services/use-cases/bank/bank-services.services";
import { nigeriaBanks } from "src/lib/nigerian-banks";

@Controller()
export class BankController {
  constructor(private services: BankServices) { }
  @Post(BANK_ROUTE.ROUTE)
  @UseGuards(StrictAuthGuard)
  async create(
    @Req() req: Request,
    @Body() body: AddBankDto,
    @Res() res: Response
  ) {
    try {

      const userId = req?.user?._id;
      const payload: IBank = {
        ...body,
        userId
      }

      const response = await this.services.create(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }


  @Get(BANK_ROUTE.ROUTE)
  @UseGuards(StrictAuthGuard)
  async findAllWithPagination(
    @Req() req: Request,
    @Query() query: any,
    @Res() res: Response
  ) {
    try {
      const payload = {
        userId: req.user._id,
        query
      }
      const response = await this.services.findAllWithPagination(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }

  @Get(BANK_ROUTE.NIGERIA_ROUTE)
  @UseGuards(StrictAuthGuard)
  async getNigeriaBanks(
    @Res() res: Response
  ) {
    try {

      return res.status(HttpStatus.OK).json(nigeriaBanks);
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }



}
