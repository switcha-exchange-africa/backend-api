import { Controller, Get } from '@nestjs/common';
import { env } from 'src/configuration';
import { HomeServices } from 'src/services/use-cases/home/home.service';
// var webPush = require('web-push');

// webPush.setVapidDetails(
//   FRONTEND_URL,
//   WEB_PUSH_PUBLIC_KEY,
//   WEB_PUSH_PRIVATE_KEY
// );






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
    return `${env.env.toUpperCase()} UPDATE TRACKING API`;
  }


  @Get('/web-push')
  webPush(): string {
    return `${env.env.toUpperCase()} API`;
  }
} 
