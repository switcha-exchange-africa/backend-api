import { Body, Controller, Get, Param, Post, Put, Query, Req, Res, UseGuards } from "@nestjs/common";
import { StrictAuthGuard } from "src/middleware-guards/auth-guard.middleware";
import { Request, Response } from "express";
import { ICreateP2pAd, IGetP2pAds, IUpdateP2pAds, P2pCreateAdDto, UpdateP2pCreateAdDto } from "src/core/dtos/p2p";
import { P2pServices } from "src/services/use-cases/trade/p2p/p2p.service";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";

@Controller()
export class P2pController {
  constructor(
    private services: P2pServices,
  ) { }

  @Post('/p2p/ads')
  @UseGuards(StrictAuthGuard)
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


  @Get('/p2p/ads')
  @UseGuards(StrictAuthGuard)
  async getAllAds(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: any
  ) {
    try {
      const userId = req?.user._id
      const {
        perpage,
        page,
        dateFrom,
        dateTo,
        sortBy,
        orderBy,
        type,
        isPublished,
        coin
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
  @UseGuards(StrictAuthGuard)
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
  @UseGuards(StrictAuthGuard)
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
}
