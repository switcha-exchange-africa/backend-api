import { Controller, Get } from '@nestjs/common';
import { env } from 'src/configuration';
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

  @Get('/name')
  name(): string {
    return `${env.env.toUpperCase()} API`;
  }
}
