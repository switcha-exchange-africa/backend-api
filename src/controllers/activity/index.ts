import {
  Controller,
  Get,
  Query,
  Req,
  Res,
} from "@nestjs/common";

import { Request, Response } from "express";
import { isAuthenticated } from "src/core/decorators";
import { ActivityServices } from "src/services/use-cases/activity/activity.service";
import { IGetActivities } from "src/core/dtos/activity";

@Controller('activities')
export class ActivityController {
  constructor(private services: ActivityServices) { }

  @isAuthenticated('strict')
  @Get('/')
  async getAllActivities(@Req() req: Request, @Query() query: any, @Res() res: Response) {
    try {

      const userId = req?.user?._id!;
      const { perpage, page, dateFrom, dateTo, sortBy, orderBy, action } = query

      const payload: IGetActivities = {
        perpage,
        userId,
        page,
        dateFrom,
        dateTo,
        sortBy,
        orderBy,
        action
      }
      const response = await this.services.getAllActivities(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }



}
