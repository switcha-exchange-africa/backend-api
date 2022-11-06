import { Controller, Get, Post, Req, Res, Query, Param } from "@nestjs/common";
import { Response, Request } from "express"
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";
import { FeeServices } from "src/services/use-cases/fees/fee.service";
import { IGetFee } from "src/core/dtos/fee";
import { isAdminAuthenticated } from "src/core/decorators";
import { ByPass } from "src/decorator";

@Controller('admin/fees')
export class AdminFeeController {

  constructor(private services: FeeServices) { }



  @Post('/')
  @isAdminAuthenticated('strict')
  @ByPass('pass')
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

  @Post('/withdrawals-fees')
  @isAdminAuthenticated('strict')
  async seedWithdrawalFees(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {

      const userId = req?.user._id
      const response = await this.services.seedWithdrawalFees(userId);

      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Get('/')
  @isAdminAuthenticated('strict')
  async getAllFees(
    @Res() res: Response,
    @Query() query: any
  ) {
    try {

      const { perpage, page, dateFrom, dateTo, sortBy, orderBy, userId, feature, amountType } = query
      const payload: IGetFee = {
        perpage, userId, page, dateFrom, dateTo, sortBy, orderBy,
        feature,
        amountType
      }

      const response = await this.services.getAllFees(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Get('/:id')
  @isAdminAuthenticated('strict')
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