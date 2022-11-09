import { Controller, Get, Res } from "@nestjs/common"
import { isAuthenticated } from "src/core/decorators"
import { Response } from 'express'
import { FeatureManagementServices } from "src/services/use-cases/feature-management/feature-management.service";

@Controller('/feature-management')
export class FeatureManagementController {

  constructor(
    private services: FeatureManagementServices
  ) { }

  @isAuthenticated('strict')
  @Get('/')
  async features(
    @Res() res: Response
  ) {
    try {
      const response = await this.services.features()
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }


}
