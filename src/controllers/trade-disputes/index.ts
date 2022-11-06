import { Controller, Get, Res, Query, Req, Body, Post, Param } from "@nestjs/common";
import { Response, Request } from "express"
import { isAuthenticated } from "src/core/decorators";
import { TradeDisputeServices } from "src/services/use-cases/trade-disputes/trade-disputes.service";
import { CreateTradeDisputeDto, ICreateTradeDispute, IGetSingleTradeDispute, IGetTradeDisputes } from "src/core/dtos/trade-disputes";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";

@Controller('trade-disputes')
export class TradeDisputeController {

  constructor(private services: TradeDisputeServices) { }

  @isAuthenticated('strict')
  @Post('/')
  async createTradeDispute(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: CreateTradeDisputeDto
  ) {
    try {
      const user = req?.user!
      const userId = user._id

      const payload: ICreateTradeDispute = {
        userId,
        email: user.email,
        ...body
      }

      const response = await this.services.createTradeDispute(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @isAuthenticated('strict')
  @Get('/')
  async getAllTradeDisputes(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: any
  ) {
    try {
      const user = req?.user
      const {
        perpage,
        page,
        dateFrom,
        dateTo,
        sortBy,
        orderBy,
        tradeId,
        disputeId,
        resolvedBy,
        resolveAdminBy,
        status,
        seller,
        buyer
      } = query

      const payload: IGetTradeDisputes = {
        perpage,
        userId: user._id,
        page,
        dateFrom,
        dateTo,
        sortBy,
        orderBy,
        email: user.email,
        tradeId,
        disputeId,
        resolvedBy,
        resolveAdminBy,
        status,
        seller,
        buyer
      }

      const response = await this.services.getAllTradeDispute(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }


  @isAuthenticated('strict')
  @Get('/:id')
  async getSingleTradeDispute(
    @Req() req: Request,
    @Res() res: Response,
    @Param() params: FindByIdDto
  ) {
    try {

      const { id } = params
      const user = req?.user
      const payload: IGetSingleTradeDispute = {
        id,
        email: user.email
      }
      const response = await this.services.getSingleTradeDispute(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }


}
//tradeID 636828f6807167e7a69588b1
// seller 63504ec4925f7b152ff97101
//buyer 63515e37c0cce65dd8225da1