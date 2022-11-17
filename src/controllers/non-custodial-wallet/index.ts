import { Body, Controller, Post, Req, Res } from "@nestjs/common/decorators"
import { isAuthenticated } from "src/core/decorators"
import { GenerateNonCustodialWalletDto, IGenerateNonCustodialWallet } from "src/core/dtos/non-custodial-wallet"
import { Request, Response } from "express"
import { NonCustodialWalletServices } from "src/services/use-cases/non-custodial-wallet/non-custodial.service"

@Controller('/non-custodial-wallet')
export class NonCustodialWalletController {

    constructor(
        private services: NonCustodialWalletServices
    ) { }

    @isAuthenticated('strict')
    @Post('/generate-wallet')
    async generateWallet(
        @Req() req: Request,
        @Body() body: GenerateNonCustodialWalletDto,
        @Res() res: Response
    ) {
        try {
            const user = req?.user
            const userId = user._id
            const email = user.email
            const payload: IGenerateNonCustodialWallet = { ...body, userId, email }
            const response = await this.services.generateWallet(payload)
            return res.status(response.status).json(response);

        } catch (error) {
            return res.status(error.status || 500).json(error);

        }
    }


}
