import {
  Body,
  Controller,
  Post,
  Res,
  Req
} from "@nestjs/common";

import { Response, Request } from "express";
import { isAuthenticated } from "src/core/decorators";
import { IWebPush, WebPushDto } from "src/core/dtos/web-push";
import { WebPushServices } from "src/services/use-cases/web-push/web-push.service";

@Controller('web-push')
export class WebPushController {
  constructor(private services: WebPushServices) { }

  @Post('/')
  @isAuthenticated('strict')
  async subscribe(
    @Res() res: Response,
    @Req() req: Request,
    @Body() body: WebPushDto
  ) {
    try {
      const userId = req.user._id
      const payload: IWebPush = { ...body, userId };
      const response = await this.services.subscribe(payload);

      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

}
