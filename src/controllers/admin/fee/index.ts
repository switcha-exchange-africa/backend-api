import { Controller, Get, Post, Req, Res, UseGuards, Query, Param } from "@nestjs/common";
import { Response, Request } from "express"
import { StrictAuthGuard } from "src/middleware-guards/auth-guard.middleware";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";
import { FeeServices } from "src/services/use-cases/fees/fee.service";
import { IGetFee } from "src/core/dtos/fee";

@Controller('admin/fees')
export class AdminFeeController {

  constructor(private services: FeeServices) { }



  @Post('/')
  @UseGuards(StrictAuthGuard)
  async seedFeed(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {

      const userId = req?.user._id
      const response = await this.services.seedFee(userId);

      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Get('/')
  @UseGuards(StrictAuthGuard)
  async getAllFees(
    @Res() res: Response,
    @Query() query: any
  ) {
    try {

      const { perpage, page, dateFrom, dateTo, sortBy, orderBy, userId, feature } = query
      const payload: IGetFee = {
        perpage, userId, page, dateFrom, dateTo, sortBy, orderBy,
        feature
      }

      const response = await this.services.getAllFees(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Get('/:id')
  @UseGuards(StrictAuthGuard)
  async getSingleFee(
    @Res() res: Response,
    @Param() params: FindByIdDto
  ) {
    try {

      const { id } = params
      const response = await this.services.getSingleFee(id);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

}