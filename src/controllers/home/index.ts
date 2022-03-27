import { Controller, Get } from '@nestjs/common';

import { HomeServices } from 'src/services/use-cases/home/home.service';

@Controller()
export class HomeController {
  constructor(
    private readonly service: HomeServices,

  ) { }

  @Get('/health')
  health(): string {
    return this.service.health();
  }
}
