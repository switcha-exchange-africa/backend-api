import { Controller, Get, Param, Query, Res, UseGuards } from "@nestjs/common";
import { StrictAuthGuard } from "src/middleware-guards/auth-guard.middleware";
import { UserServices } from "src/services/use-cases/user/user-services.services";
import { Response } from 'express'
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";

@Controller('admin/users')
export class AdminUsersController {

  constructor(private services: UserServices) { }

  @Get('/')
  @UseGuards(StrictAuthGuard)
  async getAllUsers(@Res() res: Response, @Query() query) {
    try {
      const { perpage, page, dateFrom, dateTo, sortBy, orderBy, id, authStatus, country, emailVerified, device, lock, level, dob } = query

      const response = await this.services.getAllUsers({ perpage, page, dateFrom, dateTo, sortBy, orderBy, id, authStatus, country, emailVerified, device, lock, level, dob });
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Get('/:id')
  @UseGuards(StrictAuthGuard)
  async detail(@Res() res: Response, @Param() param: FindByIdDto) {
    try {
      const { id } = param;
      const response = await this.services.getUser(id);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

}