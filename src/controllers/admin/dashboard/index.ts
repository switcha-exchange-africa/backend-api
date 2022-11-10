import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express"
import { isAdminAuthenticated } from "src/core/decorators";
import { DashboardServices } from "src/services/use-cases/dashboard/dashboard.service";
// import { ByPass } from "src/decorator";

@Controller('admin/dashboard')
export class AdminDashboardController {

  constructor(private services: DashboardServices) { }


  @isAdminAuthenticated('strict')
  @Get('/')
  async dashboard(
    // @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const response = await this.services.adminDashboard();
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }
}