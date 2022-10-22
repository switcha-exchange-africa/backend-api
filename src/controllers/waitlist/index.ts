import {
  Body,
  Controller,
  Post,
  Res,
} from "@nestjs/common";

import { Response } from "express";
import { IWaitList, WaitListDto } from "src/core/dtos/authentication/login.dto";
import { AuthServices } from "src/services/use-cases/user/auth-services.services";

@Controller('/waitlist')
export class WaitListController {

  constructor(
    private services: AuthServices
  ) { }

  @Post('/')
  async waitlist(
    @Body() body: WaitListDto,
    @Res() res: Response) {
    try {

      const payload:IWaitList = { ...body }
      const response = await this.services.waitlist(payload)
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

}
