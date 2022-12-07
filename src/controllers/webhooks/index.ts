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
import { INotificationServices } from "src/core/abstracts";
import { EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION, EXTERNAL_DEPOSIT_CHANNEL_LINK } from "src/lib/constants";

@Controller('webhook')
export class WebhookController {
    constructor(
        private services: WebhookServices,
        private readonly discordServices: INotificationServices,


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
            return res.status(error.status || 500).json(error);

        }
    }

    @Post('/tatum-incoming-transaction')
    async incomingTransactions(
        @Req() req: Request,
        @Res() res: Response,
    ) {
        try {

            if (!env.isDev) {
                const signature = req.headers['x-payload-hash']
                const encryptedData = crypto
                    .createHmac("SHA512", TATUM_WEBHOOK_SECRET)
                    .update(JSON.stringify(req.body))
                    .digest("base64");
                if (encryptedData !== signature) {
                    Logger.warn('Wrong signature')
                    await this.discordServices.inHouseNotification({
                        title: `Incoming  Deposit:- ${env.env} environment`,
                        message: `Wrong signature
                        
                        SIGNATURE :- ${signature}

                        EMCRYPTED DATA :- ${encryptedData}
                        
                        ${JSON.stringify(req.body)}
                        
                        `,
                        link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
                    })
                    return res.status(200).json({ message: "Webhook discarded" })
                }
            }
            const response = await this.services.incomingTransactions(req.body)
            return res.status(200).json(response)
        } catch (error) {
            Logger.error(error)
            if (error.name === 'TypeError') return res.status(200).json(error)
            return res.status(200).json(error)
        }
    }

    @Post('/tatum-virtual-account-incoming-transaction')
    async incomingVirtualAccountTransactions(
        @Req() req: Request,
        @Res() res: Response,
    ) {
        try {

            if (!env.isDev) {
                const signature = req.headers['x-payload-hash']
                const encryptedData = crypto
                    .createHmac("SHA512", TATUM_WEBHOOK_SECRET)
                    .update(JSON.stringify(req.body))
                    .digest("base64");
                if (encryptedData !== signature) {
                    Logger.warn('Wrong signature')
                    await this.discordServices.inHouseNotification({
                        title: `Virtual Account incoming Deposit:- ${env.env} environment`,
                        message: `Wrong signature
                        
                        SIGNATURE :- ${signature}

                        EMCRYPTED DATA :- ${encryptedData}
                        
                        ${JSON.stringify(req.body)}
                        
                        `,
                        link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
                    })
                    return res.status(200).json({ message: "Webhook discarded" })
                }
            }
            const response = await this.services.incomingVirtualAccountTransactions(req.body)
            return res.status(200).json(response)
        } catch (error) {
            Logger.error(error)
            if (error.name === 'TypeError') return res.status(200).json(error)
            return res.status(200).json(error)
        }
    }

    @Post('/tatum-pending-transaction')
    async incomingPendingTransactions(
        @Req() req: Request,
        @Res() res: Response,
    ) {
        try {

            if (!env.isDev) {
                const signature = req.headers['x-payload-hash']
                const encryptedData = crypto
                    .createHmac("SHA512", TATUM_WEBHOOK_SECRET)
                    .update(JSON.stringify(req.body))
                    .digest("base64");
                if (encryptedData !== signature) {
                    Logger.warn('Wrong signature')
                    await this.discordServices.inHouseNotification({
                        title: `Incoming Pending Deposit:- ${env.env} environment`,
                        message: `Wrong signature
                        
                        SIGNATURE :- ${signature}

                        EMCRYPTED DATA :- ${encryptedData}
                        

                        ${JSON.stringify(req.body)}
                        
                        `,
                        link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
                    })
                    return res.status(200).json({ message: "Webhook discarded" })
                }
            }

            const response = await this.services.incomingPendingTransactions(req.body)
            return res.status(200).json(response)

        } catch (error) {
            return res.status(error.status || 500).json(error);

        }
    }

    @Post('/tatum-virtual-account-pending-transaction')
    async incomingVirtualAccountPendingTransactions(
        @Req() req: Request,
        @Res() res: Response,
    ) {
        try {

            if (!env.isDev) {
                const signature = req.headers['x-payload-hash']
                const encryptedData = crypto
                    .createHmac("SHA512", TATUM_WEBHOOK_SECRET)
                    .update(JSON.stringify(req.body))
                    .digest("base64");
                if (encryptedData !== signature) {
                    Logger.warn('Wrong signature')
                    await this.discordServices.inHouseNotification({
                        title: `Virtual Account  Pending Deposit:- ${env.env} environment`,
                        message: `Wrong signature
                        
                        SIGNATURE :- ${signature}

                        EMCRYPTED DATA :- ${encryptedData}
                        

                        ${JSON.stringify(req.body)}
                        
                        `,
                        link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
                    })
                    return res.status(200).json({ message: "Webhook discarded" })
                }
            }

            const response = await this.services.incomingVirtualAccountPendingTransactions(req.body)
            return res.status(200).json(response)

        } catch (error) {
            return res.status(error.status || 500).json(error);

        }
    }
    @Post('/tatum-tx-block')
    async txBlock(
        @Req() req: Request,
        @Res() res: Response,
    ) {
        try {

            if (!env.isDev) {
                const signature = req.headers['x-payload-hash']
                const encryptedData = crypto
                    .createHmac("SHA512", TATUM_WEBHOOK_SECRET)
                    .update(JSON.stringify(req.body))
                    .digest("base64");
                if (encryptedData !== signature) {
                    Logger.warn('Wrong signature')
                    await this.discordServices.inHouseNotification({
                        title: `Withdrawal Deposit:- ${env.env} environment`,
                        message: `Wrong signature
                        
                        SIGNATURE :- ${signature}

                        EMCRYPTED DATA :- ${encryptedData}

                        ${JSON.stringify(req.body)}
                        
                        `,
                        link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
                    })
                    return res.status(200).json({ message: "Webhook discarded" })
                }
            }

            const response = await this.services.txBlock(req.body)
            return res.status(200).json(response)

        } catch (error) {
            return res.status(error.status || 500).json(error);

        }
    }


    @Post('/tatum-address-transaction')
    async addressTransaction(
        @Req() req: Request,
        @Res() res: Response,
    ) {
        try {

            if (!env.isDev) {
                const signature = req.headers['x-payload-hash']
                const encryptedData = crypto
                    .createHmac("SHA512", TATUM_WEBHOOK_SECRET)
                    .update(JSON.stringify(req.body))
                    .digest("base64");
                if (encryptedData !== signature) {
                    Logger.warn('Wrong signature')
                    await this.discordServices.inHouseNotification({
                        title: `Address Transaction For Fee Wallet:- ${env.env} environment`,
                        message: `Wrong signature
                        
                        SIGNATURE :- ${signature}

                        EMCRYPTED DATA :- ${encryptedData}

                        ${JSON.stringify(req.body)}
                        
                        `,
                        link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
                    })
                    return res.status(200).json({ message: "Webhook discarded" })
                }
            }

            const response = await this.services.addressTransaction(req.body)
            return res.status(200).json(response)

        } catch (error) {
            return res.status(error.status || 500).json(error);

        }
    }
}



