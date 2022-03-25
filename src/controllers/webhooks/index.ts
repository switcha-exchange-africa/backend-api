import {
    Body,
    Controller,
    Post,
    Req
  } from "@nestjs/common";
import { WEBHOOK_ROUTE } from "src/lib/constants";
import { Request } from "express";

@Controller()
export class WebhookEvents{

    @Post(WEBHOOK_ROUTE.ADDRESS_TRANSACTION)
    async addressTransactions(@Req() req: Request, @Body() payload:any){
        console.log(req);
        console.log(payload)
    }
}