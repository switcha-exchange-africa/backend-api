import {
    Controller,
    Logger,
    Post,
    Req,
    Res
} from "@nestjs/common";
import { WEBHOOK_ROUTE } from "src/lib/constants";
import { Request, Response } from "express";
import { WebhookServices } from "src/services/use-cases/webhook/webhook-services.services";

@Controller()
export class WebhookController {
    constructor(
        private services: WebhookServices

    ) { }
    @Post(WEBHOOK_ROUTE.ROUTE)
    async tatum(
        @Req() req: Request,
        @Res() res: Response,
    ) {
        try {
            const response = await this.services.tatum(req)
            return res.status(200).json(response)
        } catch (error) {
            Logger.error(error)
            if (error.name === 'TypeError') return res.status(200).json(error)
            return res.status(200).json(error)
        }
    }
}