import { StrictAuthGuard } from "src/middleware-guards/auth-guard.middleware";
import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";

import { Request, Response } from "express";
import { NOTIFICATION_ROUTE } from "src/lib/route-constant";
import { NotificationServices } from "src/services/use-cases/notification/notification.service";

@Controller()
export class NotificationController {
  constructor(private services: NotificationServices) { }
  @Get(NOTIFICATION_ROUTE.GET)
  @UseGuards(StrictAuthGuard)
  async findAll(@Req() req: Request, @Query() query: any, @Res() res: Response) {
    try {
      const userId = req?.user?._id;
      const payload = { query, userId }

      const response = await this.services.getAllNotifications(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }


  @Get(NOTIFICATION_ROUTE.GET_SINGLE)
  @UseGuards(StrictAuthGuard)
  async detail(
    @Res() res: Response,
    @Param() param: { id }
  ) {
    try {
      const { id } = param;
      const response = await this.services.detail(id);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

}
