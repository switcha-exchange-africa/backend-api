import { Body, Controller, Param, Post, Req, Res } from "@nestjs/common";
import { isAuthenticated } from "src/core/decorators";
import { VirtualAccountServices } from "src/services/use-cases/virtual-account/virtual-account.service";
import { Request, Response } from "express"
import { DepositVirtualAccountDto, IDepositVirtualAccount } from "src/core/dtos/virtual-account";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";

@Controller('virtual-account')
export class VirtualAccountController {
    constructor(private services: VirtualAccountServices) { }

    @isAuthenticated('strict')
    @Post('/:id')
    async deposit(
        @Req() req: Request,
        @Param() params: FindByIdDto,
        @Body() body: DepositVirtualAccountDto,
        @Res() res: Response
    ) {
        try {
            const user = req?.user
            const { id } = params
            const payload: IDepositVirtualAccount = {
                userId: user._id,
                id,
                email: user.email,
                ...body
            }
            const response = await this.services.deposit(payload)
            return res.status(response.status).json(response);

        } catch (error) {
            return res.status(error.status || 500).json(error);

        }
    }
}