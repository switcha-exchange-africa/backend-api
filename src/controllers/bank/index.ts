import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Query, Req, Res } from "@nestjs/common";
import { AddBankDto, IBank, IGetBank, IGetSingleBank } from "src/core/dtos/bank";
import { BANK_ROUTE } from "src/lib/route-constant";
import { Request, Response } from 'express';
import { BankServices } from "src/services/use-cases/bank/bank-services.services";
import { nigeriaBanks } from "src/lib/nigerian-banks";
import { isAuthenticated } from "src/core/decorators";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";

@Controller('/bank')
export class BankController {
  constructor(private services: BankServices) { }

  @isAuthenticated('strict')
  @Post('/')
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


  @isAuthenticated('strict')
  @Get('/')
  async findAllWithPagination(
    @Req() req: Request,
    @Query() query: any,
    @Res() res: Response
  ) {
    try {
      const { code, name, perpage, page, q, sortBy, orderBy, dateFrom, dateTo } = query
      const payload: IGetBank = {
        userId: req.user._id,
        code,
        name, perpage, page, q, sortBy, orderBy, dateFrom, dateTo
      }
      const response = await this.services.findAllWithPagination(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @isAuthenticated('strict')
  @Get('/:id')
  async getSingleBank(
    @Req() req: Request,
    @Param() params: FindByIdDto,
    @Res() res: Response
  ) {
    try {
      const user = req?.user
      const { id } = params
      const payload: IGetSingleBank = {
        userId: req.user._id,
        email: user.email,
        id
      }
      const response = await this.services.getSingleBank(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @isAuthenticated('strict')
  @Delete('/:id')
  async deleteBank(
    @Req() req: Request,
    @Param() params: FindByIdDto,
    @Res() res: Response
  ) {
    try {
      const user = req?.user
      const { id } = params
      const payload: IGetSingleBank = {
        userId: req.user._id,
        email: user.email,
        id
      }
      const response = await this.services.deleteBank(payload);
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
