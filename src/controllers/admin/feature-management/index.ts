import { Controller, Post, Req, Res } from "@nestjs/common";
import { Response, Request } from "express"
import { isAdminAuthenticated } from "src/core/decorators";
import { ByPass } from "src/decorator";
import { FeatureManagementServices } from "src/services/use-cases/feature-management/feature-management.service";

@Controller('admin/feature-management')
export class AdminFeatureManagementController {

  constructor(private services: FeatureManagementServices) { }


  @Post('/')
  @isAdminAuthenticated('strict')
  @ByPass('pass')
  async seed(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const userId = req?.user._id
      const response = await this.services.seed(userId);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }
}