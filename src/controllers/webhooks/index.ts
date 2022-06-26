import {
    Controller,
    Logger,
    Post,
    Req,
    Res
} from "@nestjs/common";
import { WEBHOOK_ROUTE } from "src/lib/route-constant";
import { Request, Response } from "express";
import { WebhookServices } from "src/services/use-cases/webhook/webhook-services.services";
import * as crypto from "crypto";
import { env, TATUM_WEBHOOK_SECRET } from "src/configuration";

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

    @Post(WEBHOOK_ROUTE.INCOMING_TRANSACTION_ROUTE)
    async incomingTransactions(
        @Req() req: Request,
        @Res() res: Response,
    ) {
        try {

            const signature = req.headers['x-payload-hash']
            const encryptedData = crypto
                .createHmac("SHA512", TATUM_WEBHOOK_SECRET)
                .update(JSON.stringify(req.body))
                .digest("hex");
            
            if (env.isProd && (encryptedData !== signature)) {
                Logger.warn('Wrong signature')
                return res.status(200).json({ message: "Webhook discarded" })

            }

            const response = await this.services.incomingTransactions(req.body)
            return res.status(200).json(response)
        } catch (error) {
            Logger.error(error)
            if (error.name === 'TypeError') return res.status(200).json(error)
            return res.status(200).json(error)
        }
    }
    
    @Post(WEBHOOK_ROUTE.INCOMING_PENDING_TRANSACTION_ROUTE)
    async incomingPendingTransactions(
        @Req() req: Request,
        @Res() res: Response,
    ) {
        try {

            const signature = req.headers['x-payload-hash']
            const encryptedData = crypto
                .createHmac("SHA512", TATUM_WEBHOOK_SECRET)
                .update(JSON.stringify(req.body))
                .digest("hex");
            
            if (env.isProd && (encryptedData !== signature)) {
                Logger.warn('Wrong signature')
                return res.status(200).json({ message: "Webhook discarded" })

            }
            const response = await this.services.incomingPendingTransactions(req.body)

            return res.status(200).json(response)

        } catch (error) {
            Logger.error(error)
            if (error.name === 'TypeError') return res.status(200).json(error)
            return res.status(200).json(error)
        }
    }
}


