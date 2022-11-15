import { Body, Controller, Get, Param, Put, Query, Req, Res } from "@nestjs/common";
import { isAdminAuthenticated } from "src/core/decorators";
import { IGetKyc, IProcessKyc, ProcessKycDtoDto } from "src/core/dtos/kyc";
import { KycServices } from "src/services/use-cases/kyc/kyc-services.service";
import { Response, Request } from 'express'
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";

@Controller('admin/kyc')
export class AdminKycController {

  constructor(private services: KycServices) { }

  @Get('/')
  @isAdminAuthenticated('strict')
  async getAllKyc(
    @Res() res: Response,
    @Query() query,
  ) {
    try {
      const {
        perpage,
        page,
        dateFrom,
        dateTo,
        sortBy,
        orderBy,
        userId,
        status,
        level,
        q
      } = query
      const payload: IGetKyc = {
        perpage,
        page,
        dateFrom,
        dateTo,
        sortBy,
        orderBy,
        userId,
        status,
        level,
        q

      }
      const response = await this.services.getAllKyc(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @Get('/:id')
  @isAdminAuthenticated('strict')
  async getSingleKyc(
    @Res() res: Response,
    @Param() params: FindByIdDto,
  ) {
    try {
      const { id } = params
      const response = await this.services.getSingleKyc(id);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

  @Put('/:id')
  @isAdminAuthenticated('strict')
  async processKyc(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: ProcessKycDtoDto,
    @Param() params: FindByIdDto,

  ) {
    try {
      const admin = req?.user
      const { id } = params
      const payload: IProcessKyc = {
        ...body,
        adminId: admin._id,
        adminEmail: admin.email,
        id
      }
      const response = await this.services.processKyc(payload);
      return res.status(response.status).json(response);
    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }
}