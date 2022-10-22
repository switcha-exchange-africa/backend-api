import { Body, Controller, Delete, HttpException, Logger, Param, Patch, Post, Put, Res } from "@nestjs/common";
import { ADMIN_ROUTE } from "src/lib/route-constant";
import { Response } from 'express';
import { AdminServices } from "src/services/use-cases/admin/admin-services.services";
import { AddAdminImageDto, AddAdminRoleDto, AdminDto, AdminLoginDto, ChangeAdminPasswordDto, IAddAdminImage, IAddAdminRoles, IChangeAdminPassword } from "src/core/dtos/admin";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";
import { isAuthenticated } from "src/core/decorators";

@Controller('admin')
export class AdminAuthenticationController {

  constructor(private services: AdminServices) { }

  @Post(ADMIN_ROUTE.SIGNUP_ROUTE)
  @isAuthenticated('strict')
  async signup(
    @Body() body: AdminDto,
    @Res() res: Response
  ) {
    try {

      const response = await this.services.signup(body);
      return res.status(response.status).json(response);

    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }

  @Post(ADMIN_ROUTE.LOGIN_ROUTE)
  @isAuthenticated('strict')
  async login(
    @Body() body: AdminLoginDto,
    @Res() res: Response
  ) {
    try {

      const response = await this.services.login(body);
      return res.status(response.status).json(response);

    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }




  @Put(ADMIN_ROUTE.IMAGE_ROUTE)
  @isAuthenticated('strict')
  async addImages(
    @Param() params: FindByIdDto,
    @Body() body: AddAdminImageDto,
    @Res() res: Response
  ) {
    try {
      const { id } = params
      const payload: IAddAdminImage = {
        id,
        ...body
      }

      const response = await this.services.addImage(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }
  @Put(ADMIN_ROUTE.TWO_FA_ROUTE)
  @isAuthenticated('strict')
  async enableTwoFa(
    @Param() params: FindByIdDto,
    @Res() res: Response
  ) {
    try {

      const { id } = params
      const response = await this.services.enableTwoFa(id);
      return res.status(response.status).json(response);

    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }

  @Patch(ADMIN_ROUTE.TWO_FA_ROUTE)
  @isAuthenticated('strict')
  async disableTwoFa(
    @Param() params: FindByIdDto,
    @Res() res: Response
  ) {
    try {

      const { id } = params
      const response = await this.services.disableTwoFa(id);
      return res.status(response.status).json(response);

    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }

  @Delete(ADMIN_ROUTE.IMAGE_ROUTE)
  @isAuthenticated('strict')
  async removeImage(
    @Param() params: FindByIdDto,
    @Res() res: Response
  ) {
    try {

      const { id } = params
      const response = await this.services.removeImage(id);
      return res.status(response.status).json(response);

    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }

  @Put(ADMIN_ROUTE.ROLES_ROUTE)
  @isAuthenticated('strict')
  async addRoles(
    @Param() params: FindByIdDto,
    @Body() body: AddAdminRoleDto,
    @Res() res: Response
  ) {
    try {
      const { id } = params
      const payload: IAddAdminRoles = {
        id,
        ...body
      }

      const response = await this.services.addRoles(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }

  @Put(ADMIN_ROUTE.PASSWORD_ROUTE)
  @isAuthenticated('strict')
  async changePassword(
    @Param() params: FindByIdDto,
    @Body() body: ChangeAdminPasswordDto,
    @Res() res: Response
  ) {
    try {
      const { id } = params
      const payload: IChangeAdminPassword = {
        id,
        ...body
      }

      const response = await this.services.changePassword(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new HttpException(error.message, 500);
    }
  }



}
