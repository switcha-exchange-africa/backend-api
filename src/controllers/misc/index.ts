import { Controller, Get, HttpStatus, Res } from "@nestjs/common";
import { Response } from 'express';
import { nigeriaBanks } from "src/lib/nigerian-banks";

@Controller('misc')
export class MiscController {
  constructor(
  ) { }

  @Get('/banks')
  async banks(
    @Res() res: Response
  ) {
    try {
      return res.status(HttpStatus.OK).json(nigeriaBanks);
    } catch (error) {
      return res.status(error.status || 500).json(error);
    }
  }

}
