import { Injectable, HttpStatus, Logger } from "@nestjs/common";
import { IDataServices } from "src/core/abstracts";
import { IGenerateNonCustodialWallet } from "src/core/dtos/non-custodial-wallet";
import { IErrorReporter } from "src/core/types/error";
import { ResponseState } from "src/core/types/response";
import { UtilsServices } from "../utils/utils.service";
import { NonCustodialWalletLib } from "./non-custodial.lib";

@Injectable()
export class NonCustodialWalletServices {
    constructor(
        private readonly data: IDataServices,
        private readonly utilsService: UtilsServices,
        private readonly lib: NonCustodialWalletLib
    ) { }


    async generateWallet(payload: IGenerateNonCustodialWallet) {
        const { email, coin } = payload
        try {
            console.log(coin)
            const coinExists = await this.data.coins.findOne({})
            if (!coinExists) {
                return Promise.reject({
                    status: HttpStatus.NOT_FOUND,
                    state: ResponseState.ERROR,
                    message: 'Coin does not exists',
                    error: null
                })
            }
            const generatedWallet = await this.lib.generateEthWallet()
            console.log(generatedWallet)
            return {
                message: 'Wallet created successfully',
                status: HttpStatus.CREATED,
                data: generatedWallet,
                state: ResponseState.SUCCESS
            }

        } catch (error) {
            Logger.error(error)
            const errorPayload: IErrorReporter = {
                action: 'GENERATING NON CUSTODIAL WALLET',
                error,
                message: error.message
            }

            this.utilsService.errorReporter(errorPayload)
            return Promise.reject({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                state: ResponseState.ERROR,
                email,
                message: error.message,
                error: error
            })
        }
    }

}
