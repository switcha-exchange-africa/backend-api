import { Injectable, Logger } from "@nestjs/common"
import { TATUM_BASE_URL, TATUM_CONFIG, TRON_BASE_DIVISOR, TRC_20_TRON_FEE_AMOUNT, TRC_20_TRON_ACTIVATION_AMOUNT } from "src/configuration"
import { IDataServices } from "src/core/abstracts"
import { IHttpServices } from "src/core/abstracts/http-services.abstract"
import { IErrorReporter } from "src/core/types/error"
import { UtilsServices } from "../../utils/utils.service"
import { WithdrawalLib } from "../../withdrawal/withdrawal.lib"
import * as _ from "lodash"
import { OnEvent } from "@nestjs/event-emitter"


@Injectable()
export class ActivateWalletListener {
    constructor(
        private readonly withdrawalLib: WithdrawalLib,
        private readonly data: IDataServices,
        private readonly http: IHttpServices,
        private readonly utils: UtilsServices,
    ) { }

    /**
     * @desc event emitter to activation users usdt-tron wallet, sending 1 tron o activate it 
     * then update on the db
     * @nb will keep monitoring this operation
     * @param event 
     */
    @OnEvent('activate.trc20.wallet', { async: true })
    async activateUsdtTronWallet(event: { destination: string, email: string }) {
        const { destination, email } = event
        try {
            console.log("ENTERING ACTIVATE WALLET")
            const destinationWallet = await this.data.wallets.findOne({ address: destination, coin: 'USDT_TRON' })
            if (!destinationWallet) {
                Logger.error('activate.trc20.wallet', 'USDT_TRON destination wallet does not exists')
                throw new Error(`USDT_TRON fee wallet does not exists`)
            }
            const coinFeeWallet = await this.data.feeWallets.findOne({ coin: 'USDT_TRON' })
            if (!coinFeeWallet) {
                // send notification to discord
                Logger.error('activate.trc20.wallet', 'USDT_TRON fee wallet does not exists')
                throw new Error(`USDT_TRON fee wallet does not exists`)
            }


            const coinFeeWalletTrxBalance = await this.http.get(
                `${TATUM_BASE_URL}/tron/account/${coinFeeWallet.address}`,

                TATUM_CONFIG
            )
            const coinFeeWalletTrxConversionBalance = _.divide(coinFeeWalletTrxBalance.balance, TRON_BASE_DIVISOR)
            if (coinFeeWalletTrxConversionBalance < Number(TRC_20_TRON_FEE_AMOUNT)) {
                Logger.error('activate.trc20.wallet', `Master usdt-tron tron's balance is less than ${TRC_20_TRON_FEE_AMOUNT}`)
                throw new Error(`Master usdt-tron tron's balance is less than ${TRC_20_TRON_FEE_AMOUNT}`)
            }

            await this.withdrawalLib.withdrawalV3({
                coin: 'TRON',
                amount: TRC_20_TRON_ACTIVATION_AMOUNT,
                destination,
                from: coinFeeWallet.address,
                isMasterWallet: true,
                derivationKey: coinFeeWallet.derivationKey
            })
            await this.data.wallets.update({ _id: destinationWallet._id }, { isActivated: true })

        } catch (error) {
            Logger.error(error)

            const errorPayload: IErrorReporter = {
                action: 'Activating Tron Wallet',
                error,
                email,
                message: error.message
            }
            this.utils.errorReporter(errorPayload)
        }
    }
}