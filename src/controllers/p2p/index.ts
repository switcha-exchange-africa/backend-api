import { Body, Controller, Get, Param, Post, Put, Query, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { ICreateP2pAd, ICreateP2pAdBank, ICreateP2pOrder, IGetP2pAdBank, IGetP2pAds, IP2pConfirmOrder, IUpdateP2pAds, P2pAdCreateBankDto, P2pConfirmOrderDto, P2pCreateAdDto, P2pCreateOrderDto, UpdateP2pCreateAdDto } from "src/core/dtos/p2p";
import { P2pServices } from "src/services/use-cases/trade/p2p/p2p.service";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";
import { isAuthenticated } from "src/core/decorators";

@Controller()
export class P2pController {
  constructor(
    private services: P2pServices,
  ) { }

  @Post('/p2p/ads')
  @isAuthenticated('strict')
  async createAds(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: P2pCreateAdDto
  ) {
    try {
      const userId = req?.user?._id;
      const payload: ICreateP2pAd = { ...body, userId }

      const response = await this.services.createAds(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @Post('/p2p/bank')
  @isAuthenticated('strict')
  async createAdsBank(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: P2pAdCreateBankDto
  ) {
    try {
      const userId = req?.user?._id;
      const payload: ICreateP2pAdBank = { ...body, userId }

      const response = await this.services.createAdsBank(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @Get('/p2p/bank')
  @isAuthenticated('strict')
  async getAllAdsBank(
    @Res() res: Response,
    @Query() query: any
  ) {
    try {
      const {
        perpage,
        page,
        dateFrom,
        dateTo,
        sortBy,
        orderBy,

        userId,
        isActive,
        isAcceptingToPaymentTo,
        isWillingToPayTo
      } = query
      const payload: IGetP2pAdBank = {
        perpage, userId, page, dateFrom, dateTo, sortBy, orderBy,
        isActive,
        isAcceptingToPaymentTo,
        isWillingToPayTo
      }

      const response = await this.services.getAllAdsBank(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @Get('/p2p/bank/:id')
  @isAuthenticated('strict')
  async getSingleAdBank(
    @Res() res: Response,
    @Param() params: FindByIdDto,
  ) {
    try {
      const { id } = params

      const response = await this.services.getSingleAdBank(id);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @Post('/p2p/bank/:id')
  @isAuthenticated('strict')
  async disableAdsBank(
    @Res() res: Response,
    @Param() params: FindByIdDto,

  ) {
    try {
      const { id } = params

      const response = await this.services.disableAdsBank(id);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @Get('/p2p/ads')
  @isAuthenticated('strict')
  async getAllAds(
    @Res() res: Response,
    @Query() query: any
  ) {
    try {
      const {
        perpage,
        page,
        dateFrom,
        dateTo,
        sortBy,
        orderBy,
        type,
        isPublished,
        coin,
        userId
      } = query
      const payload: IGetP2pAds = {
        perpage, userId, page, dateFrom, dateTo, sortBy, orderBy, type,
        isPublished, coin
      }

      const response = await this.services.getAllAds(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }



  @Get('/p2p/ads/:id')
  @isAuthenticated('strict')
  async getSingleAd(
    @Res() res: Response,
    @Param() params: FindByIdDto
  ) {
    try {
      const { id } = params
      const response = await this.services.getSingleAd(id);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @Put('/p2p/ads/:id')
  @isAuthenticated('strict')
  async editAds(
    @Res() res: Response,
    @Param() params: FindByIdDto,
    @Body() body: UpdateP2pCreateAdDto
  ) {
    try {

      const { id } = params
      const payload: IUpdateP2pAds = { id, ...body }

      const response = await this.services.editAds(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }


  @Post('/p2p/order')
  @isAuthenticated('strict')
  async createP2pOrder(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: P2pCreateOrderDto
  ) {
    try {
      const clientId = req?.user?._id;

      const payload: ICreateP2pOrder = { ...body, clientId }

      const response = await this.services.createP2pOrder(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }


  @Post('/p2p/order/:id')
  @isAuthenticated('strict')
  async confirmP2pOrder(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: P2pConfirmOrderDto,
    @Param() params: FindByIdDto

  ) {
    try {
      const userId = req?.user?._id;
      const email = req?.user?.email
      const { id } = params
      const payload: IP2pConfirmOrder = {
        ...body, userId, orderId: id, email
      }

      const response = await this.services.confirmP2pOrder(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @Get('/p2p/order/:id')
  @isAuthenticated('strict')
  async getSingleP2pOrder(
    @Res() res: Response,
    @Param() params: FindByIdDto

  ) {
    try {

      const { id } = params


      const response = await this.services.getSingleP2pOrder(id);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }



}
