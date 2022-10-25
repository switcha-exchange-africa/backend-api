import { Body, Controller, Delete, Patch, Post, Put, Req, Res } from "@nestjs/common";
import { Response, Request } from 'express';
import { AdminServices } from "src/services/use-cases/admin/admin-services.services";
import { AddAdminImageDto, AddAdminRoleDto, AdminDto, AdminLoginDto, ChangeAdminPasswordDto, IAddAdminImage, IAddAdminRoles, IChangeAdminPassword } from "src/core/dtos/admin";
import { isAdminAuthenticated } from "src/core/decorators";

@Controller('admin')
export class AdminAuthenticationController {

  constructor(private services: AdminServices) { }

  @Post('/signup')
  async signup(
    @Body() body: AdminDto,
    @Res() res: Response
  ) {
    try {

      const response = await this.services.signup(body);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Post('/login')
  async login(
    @Body() body: AdminLoginDto,
    @Res() res: Response
  ) {
    try {

      const response = await this.services.login(body);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }




  @Post('/image')
  @isAdminAuthenticated('strict')
  async addImages(
    @Req() req: Request,
    @Body() body: AddAdminImageDto,
    @Res() res: Response
  ) {
    try {
      const user = req?.user
      const payload: IAddAdminImage = {
        id: user._id,
        email: user.email,
        ...body
      }

      const response = await this.services.addImage(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }
  @Put('/two-fa')
  @isAdminAuthenticated('strict')
  async enableTwoFa(
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const user = req?.user
      const response = await this.services.enableTwoFa(user._id);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Patch('/two-fa')
  @isAdminAuthenticated('strict')
  async disableTwoFa(
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {

      const user = req?.user
      const response = await this.services.disableTwoFa(user._id);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Delete('/image')
  @isAdminAuthenticated('strict')
  async removeImage(
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {

      const user = req?.user
      const response = await this.services.removeImage(user._id);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Put("/roles")
  @isAdminAuthenticated('strict')
  async addRoles(
    @Req() req: Request,
    @Body() body: AddAdminRoleDto,
    @Res() res: Response
  ) {
    try {
      const user = req?.user
      const payload: IAddAdminRoles = {
        id: String(user._id),
        ...body
      }

      const response = await this.services.addRoles(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Put('/password')
  @isAdminAuthenticated('strict')
  async changePassword(
    @Req() req: Request,
    @Body() body: ChangeAdminPasswordDto,
    @Res() res: Response
  ) {
    try {
      const user = req?.user
      const payload: IChangeAdminPassword = {
        id: String(user._id),
        ...body
      }

      const response = await this.services.changePassword(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }



}
