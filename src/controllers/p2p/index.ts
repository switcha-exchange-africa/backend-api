import { Body, Controller, Get, Param, Post, Put, Query, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { FindByOrderIdDto, ICreateP2pAd, ICreateP2pAdBank, ICreateP2pOrder, IGetOrderByOrderId, IGetP2pAdBank, IGetP2pAds, IGetP2pOrders, IP2pConfirmOrder, IP2pNotifyMerchant, IUpdateP2pAds, P2pAdCreateBankDto, P2pConfirmOrderDto, P2pCreateAdDto, P2pCreateOrderDto, UpdateP2pCreateAdDto } from "src/core/dtos/p2p";
import { P2pServices } from "src/services/use-cases/trade/p2p/p2p.service";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";
import { isAuthenticated } from "src/core/decorators";
import { FeatureManagement } from "src/decorator";
import { FeatureEnum } from "src/core/dtos/activity";

@Controller()
export class P2pController {
  constructor(
    private services: P2pServices,
  ) { }

  @isAuthenticated('strict')
  // @IsLevelThree('three')
  @FeatureManagement(FeatureEnum.P2P_AD)
  @Post('/p2p/ads')
  async createAds(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: P2pCreateAdDto
  ) {
    try {
      const userId = req?.user?._id;
      const payload: ICreateP2pAd = { ...body, userId, email: req?.user?.email }

      const response = await this.services.createAds(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @isAuthenticated('strict')
  // @IsLevelThree('three')
  @Post('/p2p/bank')
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
    @Req() req: Request,
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
        isActive,
        isAcceptingToPaymentTo,
        isWillingToPayTo
      } = query
      const userId = req.user._id
      const payload: IGetP2pAdBank = {
        perpage,
        userId, page,
        type,
        dateFrom, dateTo, sortBy, orderBy,
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


  @isAuthenticated('strict')
  // @IsLevelThree('three')
  @Post('/p2p/bank/:id')
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
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: any
  ) {
    try {
      const user = req?.user!
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
        userId,
        isSwitchaMerchant,
        status,
        cash,
        paymentTimeLimit
      } = query
      const payload: IGetP2pAds = {
        perpage, userId, page, dateFrom, dateTo, sortBy, orderBy, type,
        isPublished, coin, isSwitchaMerchant,
        email: user.email,
        status,
        cash,
        paymentTimeLimit
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

  @FeatureManagement(FeatureEnum.P2P_AD)
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

  @isAuthenticated('strict')
  // @IsLevelThree('three')
  @FeatureManagement(FeatureEnum.P2P_ORDER)
  @Post('/p2p/order')
  async createP2pOrder(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: P2pCreateOrderDto
  ) {
    try {
      const clientId = req?.user?._id;

      const payload: ICreateP2pOrder = {
        ...body,
        clientId,
        email: req?.user?.email,
        firstName: req?.user?.firstName,
        lastName: req?.user?.lastName
      }

      const response = await this.services.createP2pOrder(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @FeatureManagement(FeatureEnum.P2P_ORDER)
  @Get('/p2p/order/merchant')
  @isAuthenticated('strict')
  async getP2pOrdersMerchant(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query) {
    try {
      const {
        perpage,
        page,
        dateFrom,
        dateTo,
        sortBy,
        orderBy,
        clientId,
        adId,
        clientWalletId,
        type,
        status,
        orderId,
        bankId,
        method,
        q
      } = query
      const merchantId = req?.user?._id;

      const payload: IGetP2pOrders = {
        perpage,
        page,
        dateFrom,
        dateTo,
        sortBy,
        orderBy,
        merchantId,
        clientId,
        adId,
        clientWalletId,
        type,
        status,
        orderId,
        bankId,
        method,
        email: req?.user?.email,
        q
      }
      const response = await this.services.getP2pOrders(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @FeatureManagement(FeatureEnum.P2P_ORDER)
  @Get('/p2p/order/client')
  @isAuthenticated('strict')
  async getP2pOrdersClient(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query
  ) {
    try {
      const {
        perpage,
        page,
        dateFrom,
        dateTo,
        sortBy,
        orderBy,
        merchantId,
        adId,
        clientWalletId,
        type,
        status,
        orderId,
        bankId,
        method,
        q
      } = query
      const clientId = req?.user?._id;

      const payload: IGetP2pOrders = {
        perpage,
        page,
        dateFrom,
        dateTo,
        sortBy,
        orderBy,
        merchantId,
        clientId,
        adId,
        clientWalletId,
        type,
        status,
        orderId,
        bankId,
        method,
        email: req?.user?.email,
        q
      }
      const response = await this.services.getP2pOrders(payload);
      return res.status(response.status).json(response);


    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @isAuthenticated('strict')
  // @IsLevelThree('three')
  @FeatureManagement(FeatureEnum.P2P_ORDER)
  @Post('/p2p/order/:id')
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

  @isAuthenticated('strict')
  // @IsLevelThree('three')
  @FeatureManagement(FeatureEnum.P2P_ORDER)
  @Post('/p2p/order/:id/notify-merchant')
  async notifyMerchantP2pOrder(
    @Req() req: Request,
    @Res() res: Response,
    @Param() params: FindByIdDto

  ) {
    try {
      const user = req?.user
      const userId = user._id;
      const email = user.email
      const { id } = params
      const payload: IP2pNotifyMerchant = {
        userId,
        orderId: id,
        email,
        fullName: `${user.firstName} ${user.lastName}`,
        username: user.username
      }

      const response = await this.services.notifyMerchantP2pOrder(payload);
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

  @Get('/p2p/order-id/:orderId')
  @isAuthenticated('strict')
  async getSingleP2pOrderByOrderId(
    @Res() res: Response,
    @Param() params: FindByOrderIdDto,
    @Req() req: Request
  ) {
    try {
      const user = req?.user
      const { orderId } = params
      const payload: IGetOrderByOrderId = {
        email: user.email,
        userId: user._id,
        orderId
      }
      const response = await this.services.getSingleP2pOrderByOrderId(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }


}
