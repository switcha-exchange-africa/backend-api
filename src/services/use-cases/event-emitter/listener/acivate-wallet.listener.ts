import { Injectable, Logger } from "@nestjs/common"
import { TATUM_BASE_URL, TATUM_CONFIG, TRON_BASE_DIVISOR, TRC_20_TRON_FEE_AMOUNT, TATUM_PRIVATE_KEY_USER_NAME, TATUM_PRIVATE_KEY_USER_ID, TATUM_PRIVATE_KEY_PIN, TRC_20_TRON_ACTIVATION_AMOUNT } from "src/configuration"
import { IDataServices } from "src/core/abstracts"
import { IHttpServices } from "src/core/abstracts/http-services.abstract"
import { IErrorReporter } from "src/core/types/error"
import { decryptData } from "src/lib/utils"
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

    @OnEvent('activate.trc20.wallet', { async: true })
    async activateUsdtTronWallet(event: { destination: string, email: string }) {
        const { destination, email } = event
        try {

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
                Logger.error('send.to.trc20.fee.wallet', `Master usdt-tron tron's balance is less than ${TRC_20_TRON_FEE_AMOUNT}`)
                throw new Error(`Master usdt-tron tron's balance is less than ${TRC_20_TRON_FEE_AMOUNT}`)
            }

            const coinFeeWalletPrivateKey = decryptData({
                text: coinFeeWallet.privateKey,
                username: TATUM_PRIVATE_KEY_USER_NAME,
                userId: TATUM_PRIVATE_KEY_USER_ID,
                pin: TATUM_PRIVATE_KEY_PIN
            })
            await this.withdrawalLib.withdrawalV3({
                coin: 'TRON',
                amount: TRC_20_TRON_ACTIVATION_AMOUNT,
                destination,
                from: coinFeeWallet.address,
                privateKey: coinFeeWalletPrivateKey
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