import { Body, Controller, Get, Param, Post, Put, Query, Res } from "@nestjs/common";
import { UserServices } from "src/services/use-cases/user/user-services.services";
import { Response } from 'express'
import { AddMultipleUsersDto, FindByIdDto, IMutateUserAccount, MutateUserAccountDto } from "src/core/dtos/authentication/login.dto";
import { isAdminAuthenticated } from "src/core/decorators";
import { IGetLoginHistory, IGetUsers } from "src/core/dtos/users";

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
  @Post('/multiple')
  async addMultipleUsers(@Res() res: Response, @Body() body: AddMultipleUsersDto) {
    try {
      const { users } = body
      const response = await this.services.addMultipleUsers(users);
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


  @isAdminAuthenticated('strict')
  @Put('/:id/blacklist')
  async blacklist(@Res() res: Response, @Body() body: MutateUserAccountDto, @Param() param: FindByIdDto) {
    try {
      const { id } = param;
      const { reason } = body
      const payload: IMutateUserAccount = {
        id,
        reason
      }
      const response = await this.services.blacklist(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @isAdminAuthenticated('strict')
  @Put('/:id/disable')
  async disable(@Res() res: Response, @Body() body: MutateUserAccountDto, @Param() param: FindByIdDto) {
    try {
      const { id } = param;
      const { reason } = body
      const payload: IMutateUserAccount = {
        id,
        reason
      }
      const response = await this.services.disable(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @isAdminAuthenticated('strict')
  @Put('/:id/lock')
  async lock(@Res() res: Response, @Body() body: MutateUserAccountDto, @Param() param: FindByIdDto) {
    try {
      const { id } = param;
      const { reason } = body
      const payload: IMutateUserAccount = {
        id,
        reason
      }
      const response = await this.services.lock(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @isAdminAuthenticated('strict')
  @Get('/:id/login-history')
  async loginHistories(@Res() res: Response, @Param() param: FindByIdDto, @Query() query: any) {
    try {
      const {
        perpage,
        page,
        dateFrom,
        dateTo,
        sortBy,
        orderBy,
        platform,
        location,
        browser,
        durationTimeInSec,
        durationTimeInMin,
        id,
        type
      } = query
      const { id: userId } = param;

      const payload: IGetLoginHistory = {
        perpage,
        page,
        dateFrom,
        dateTo,
        sortBy,
        orderBy,
        platform,
        location,
        browser,
        durationTimeInSec,
        durationTimeInMin,
        userId: String(userId),
        id,
        type

      }
      const response = await this.services.loginHistories(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

}