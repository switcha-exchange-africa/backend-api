import { Body, Controller, Get, HttpStatus, Post, Query, Req, Res } from "@nestjs/common";
import { AddBankDto, IBank } from "src/core/dtos/bank";
import { BANK_ROUTE } from "src/lib/route-constant";
import { Request, Response } from 'express';
import { BankServices } from "src/services/use-cases/bank/bank-services.services";
import { nigeriaBanks } from "src/lib/nigerian-banks";
import { isAuthenticated } from "src/core/decorators";

@Controller()
export class BankController {
  constructor(private services: BankServices) { }
  @Post(BANK_ROUTE.ROUTE)
  @isAuthenticated('strict')
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
      return res.status(error.status || 500).json(error);

    }
  }


  @Get(BANK_ROUTE.ROUTE)
  @isAuthenticated('strict')
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
      return res.status(error.status || 500).json(error);
    }
  }

  @Get(BANK_ROUTE.NIGERIA_ROUTE)
  @isAuthenticated('strict')
  async getNigeriaBanks(
    @Res() res: Response
  ) {
    try {
      return res.status(HttpStatus.OK).json(nigeriaBanks);
    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }



}
