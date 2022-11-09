import { Controller, Get, Param, Query, Res } from "@nestjs/common";
import { UserServices } from "src/services/use-cases/user/user-services.services";
import { Response } from 'express'
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";
import { isAdminAuthenticated } from "src/core/decorators";
import { IGetUsers } from "src/core/dtos/users";

@Controller('admin/users')
export class AdminUsersController {

  constructor(private services: UserServices) { }

  @isAdminAuthenticated('strict')
  @Get('/')
  async getAllUsers(@Res() res: Response, @Query() query) {
    try {
      const {
        perpage,
        page,
        dateFrom,
        dateTo,
        sortBy,
        orderBy,
        id,
        country,
        emailVerified,
        device,
        lock,
        level,
        dob,
        q,
        firstName,
        lastName,
        username,
        email,
        agreedToTerms,
        lastLoginDate,
        createdAt,
        isWaitList,
        isSwitchaMerchant
      } = query
      const payload: IGetUsers = {
        perpage,
        page,
        dateFrom,
        dateTo,
        sortBy,
        orderBy,
        id,
        country,
        emailVerified,
        device,
        lock,
        level,
        dob,
        q,
        firstName,
        lastName,
        username,
        email,
        agreedToTerms,
        lastLoginDate,
        createdAt,
        isWaitList,
        isSwitchaMerchant
      }
      const response = await this.services.getAllUsers(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @isAdminAuthenticated('strict')
  @Get('/:id')
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