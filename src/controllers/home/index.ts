import { Controller, Get } from '@nestjs/common';
import { env, FRONTEND_URL, WEB_PUSH_PRIVATE_KEY, WEB_PUSH_PUBLIC_KEY } from 'src/configuration';
import { HomeServices } from 'src/services/use-cases/home/home.service';
var webPush = require('web-push');

webPush.setVapidDetails(
	FRONTEND_URL,
	WEB_PUSH_PUBLIC_KEY,
	WEB_PUSH_PRIVATE_KEY
  );


  
  
  
  
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


  @Get('/web-push')
  webPush(): string {
    return `${env.env.toUpperCase()} API`;
  }
} 
