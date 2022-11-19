import { Body, Controller, Get, Param, Post, Query, Req, Res } from "@nestjs/common";
import { isAuthenticated } from "src/core/decorators";
import { VirtualAccountServices } from "src/services/use-cases/virtual-account/virtual-account.service";
import { Request, Response } from "express"
import { DepositVirtualAccountDto, IDepositVirtualAccount, IGetVirtualAccounts, IWithdrawVirtualAccount, WithdrawVirtualAccountDto } from "src/core/dtos/virtual-account";
import { FindByIdDto } from "src/core/dtos/authentication/login.dto";

@Controller('virtual-account')
export class VirtualAccountController {
    constructor(private services: VirtualAccountServices) { }

    @isAuthenticated('strict')
    @Get('/')
    async getAllVirtualAccounts(
        @Req() req: Request,
        @Query() query: any,
        @Res() res: Response
    ) {
        try {
            const {
                coin,
                accountId,
                pendingTransactionSubscriptionId,
                incomingTransactionSubscriptionId,
                withdrawalTransactionSubscriptionId,
                active,
                page,
                q,
                perpage,
                orderBy,
                sortBy,
                frozen,
                dateFrom,
                dateTo
            } = query
            const payload: IGetVirtualAccounts = {
                coin,
                userId: req?.user._id,
                accountId,
                pendingTransactionSubscriptionId,
                incomingTransactionSubscriptionId,
                withdrawalTransactionSubscriptionId,
                active,
                frozen,
                q,
                page,
                perpage,
                orderBy,
                sortBy,
                dateFrom,
                dateTo,
                email: req?.user.email,
            }
            const response = await this.services.getAllVirtualAccounts(payload)
            return res.status(response.status).json(response);

        } catch (error) {
            return res.status(error.status || 500).json(error);

        }
    }

    @isAuthenticated('strict')
    @Post('/:id/deposit')
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

    @isAuthenticated('strict')
    @Get('/:id')
    async getSingleVirtualAccount(
        @Req() req: Request,
        @Res() res: Response,
        @Param() param: FindByIdDto
    ) {
        try {
            const { id } = param;
            const user = req?.user
            const response = await this.services.getSingleVirtualAccount({ id, email: user.email });
            return res.status(response.status).json(response);
        } catch (error) {
            return res.status(error.status || 500).json(error);

        }
    }

    @isAuthenticated('strict')
    @Get('/:id/deposit')
    async getVirtualAccountDepositAddress(
        @Req() req: Request,
        @Param() params: FindByIdDto,
        @Query() query: any,
        @Res() res: Response
    ) {
        try {
            const user = req?.user
            const { id } = params
            const { coin } = query

            const payload = {
                userId: user._id,
                accountId: String(id),
                email: user.email,
                coin
            }
            const response = await this.services.getVirtualAccountDepositAddress(payload)
            return res.status(response.status).json(response);

        } catch (error) {
            return res.status(error.status || 500).json(error);

        }
    }


    @isAuthenticated('strict')
    @Post('/:id/withdraw')
    async withdraw(
        @Req() req: Request,
        @Param() params: FindByIdDto,
        @Body() body: WithdrawVirtualAccountDto,
        @Res() res: Response
    ) {
        try {
            const user = req?.user
            const { id } = params
            const payload: IWithdrawVirtualAccount = {
                userId: user._id,
                id,
                email: user.email,
                ...body
            }
            const response = await this.services.withdraw(payload)
            return res.status(response.status).json(response);

        } catch (error) {
            return res.status(error.status || 500).json(error);

        }
    }
}