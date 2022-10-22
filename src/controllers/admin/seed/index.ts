import { Controller, Post, Req, Res } from "@nestjs/common";
import { Response, Request } from "express"
import { isAuthenticated } from "src/core/decorators";
import { ByPass } from "src/decorator";
import { SeedServices } from "src/services/use-cases/seed/seed.service";

@Controller('admin/seed')
export class AdminSeedController {

  constructor(private services: SeedServices) { }


  @Post('/')
  @isAuthenticated('strict')
  @ByPass('pass')
  async seed(@Req() req: Request, @Res() res: Response) {
    try {

      const userId = req?.user?._id
      const response = await this.services.seed(userId);

      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }
}