import { Controller, Post } from "@nestjs/common/decorators"
import { isAuthenticated } from "src/core/decorators"

@Controller('/non-custodial-wallet')
export class NonCustodialWalletController {

    constructor(
        private services: NonCustodialWalletServices
    ) { }

    @isAuthenticated('strict')
    @Post('/generate-wallet')
    async levelTwo(
        @Req() req: Request,
        @Body() body: GenerateNonCustodialWallet,
        @Res() res: Response
    ) {
        try {
            const user = req?.user
            const userId = user._id
            const email = user.email
            const payload: IKycLevelTwo = { ...body, userId, email }
            const response = await this.services.levelTwo(payload)
            return res.status(response.status).json(response);

        } catch (error) {
            return res.status(error.status || 500).json(error);

        }
    }


}
