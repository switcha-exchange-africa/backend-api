import { Controller, Get, Res, Param, Query } from "@nestjs/common";
import { Response } from "express"
import { CalculateTradeFeeDto, CalculateWithdrawalFeeDto, FindByFeatureDto } from "src/core/dtos/authentication/login.dto";
import { FeeServices } from "src/services/use-cases/fees/fee.service";
import { isAuthenticated } from "src/core/decorators";

@Controller('fees')
export class FeeController {

  constructor(private services: FeeServices) { }

  @Get('/trade')
  @isAuthenticated('strict')
  async calculateTradeFees(
    @Res() res: Response,
    @Query() query: CalculateTradeFeeDto
  ) {
    try {

      const { operation, amount } = query
      const payload = {
        operation,
        amount
      }
      const response = await this.services.calculateTradeFees(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Get('/withdrawal')
  @isAuthenticated('strict')
  async calculateWithdrawalFees(
    @Res() res: Response,
    @Query() query: CalculateWithdrawalFeeDto
  ) {
    try {

      const { coin, amount } = query
      const payload = {
        coin,
        amount
      }
      const response = await this.services.calculateWithdrawalFees(payload);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }

  @Get('/:feature')
  @isAuthenticated('strict')
  async getSingleFeeByFeature(
    @Res() res: Response,
    @Param() params: FindByFeatureDto
  ) {
    try {

      const { feature } = params
      const response = await this.services.getSingleFeeByFeature(feature);
      return res.status(response.status).json(response);

    } catch (error) {
      return res.status(error.status || 500).json(error);

    }
  }



}