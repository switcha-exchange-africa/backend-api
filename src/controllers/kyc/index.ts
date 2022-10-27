import {
  Body,
  Controller,
  Post,
  Req,
  Res,
} from "@nestjs/common";

import { Response, Request } from "express";
import { AddKycLevelThreeDto, AddKycLevelTwoDto, IKycLevelThree, IKycLevelTwo } from "src/core/dtos/kyc";
import { KycServices } from "src/services/use-cases/kyc/kyc-services.service";

@Controller('/kyc')
export class KycController {

  constructor(
    private services: KycServices
  ) { }

  @Post('/level-two')
  async levelTwo(
    @Req() req: Request,
    @Body() body: AddKycLevelTwoDto,
    @Res() res: Response
  ) {
    try {
      const user = req?.user
      const userId = user._id
      const email = user.email
      const payload: IKycLevelTwo = { ...body, userId, email }
      const response = await this.services.levelTwo(payload)
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Post('/level-three')
  async levelThree(
    @Req() req: Request,
    @Body() body: AddKycLevelThreeDto,
    @Res() res: Response
  ) {
    try {
      const user = req?.user
      const userId = user._id
      const email = user.email
      const payload: IKycLevelThree = { ...body, userId, email }
      const response = await this.services.levelThree(payload)
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }
}
