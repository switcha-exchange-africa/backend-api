import { Injectable, Logger } from "@nestjs/common"
import { TATUM_BASE_URL, TATUM_BTC_MNEMONIC, TATUM_BTC_XPUB_KEY, TATUM_CONFIG, TATUM_ETH_MNEMONIC, TATUM_TRON_MNEMONIC } from "src/configuration"
import { Currency } from '@tatumio/api-client'
import { IHttpServices } from "src/core/abstracts/http-services.abstract"

@Injectable()
export class WithdrawalLib {
    constructor(
        private readonly http: IHttpServices,

    ) { }
    async withdrawal(payload: {
        accountId: string,
        coin: string,
        amount: string,
        destination: string,
        index: number
    }) {
        try {
            const { accountId, coin, amount, destination, index } = payload
            if (coin === Currency.BTC) {

                const transfer = await this.http.post(
                    `${TATUM_BASE_URL}/offchain/bitcoin/transfer`,
                    {

                        senderAccountId: accountId,
                        address: destination,
                        index,
                        mnemonic: TATUM_BTC_MNEMONIC,
                        amount: String(amount),
                        fee: '0.00001',
                        xpub: TATUM_BTC_XPUB_KEY
                    },
                    TATUM_CONFIG
                )
                return transfer
            }

            if (coin === Currency.ETH) {

                const transfer = await this.http.post(
                    `${TATUM_BASE_URL}/offchain/ethereum/transfer`,
                    {

                        senderAccountId: accountId,
                        address: destination,
                        index,
                        mnemonic: TATUM_ETH_MNEMONIC,
                        amount: String(amount),
                        fee: "0.00042"
                    },
                    TATUM_CONFIG
                )
                return transfer
            }
            if (coin === Currency.USDT || coin === Currency.USDC) {

                const transfer = await this.http.post(
                    `${TATUM_BASE_URL}/offchain/ethereum/erc20/transfer`,
                    {

                        senderAccountId: accountId,
                        address: destination,
                        index,
                        mnemonic: TATUM_ETH_MNEMONIC,
                        amount: String(amount),
                        fee: "0.00042"
                    },
                    TATUM_CONFIG
                )
                return transfer
            }


            if (coin === Currency.USDT_TRON || coin === Currency.TRON) {

                const transfer = await this.http.post(
                    `${TATUM_BASE_URL}/offchain/tron/transfer`,
                    {

                        senderAccountId: accountId,
                        address: destination,
                        index,
                        mnemonic: TATUM_TRON_MNEMONIC,
                        amount: String(amount),
                    },
                    TATUM_CONFIG
                )
                return transfer
            }
        } catch (error) {
            Logger.error(error)
            throw new Error(error)
        }
    }
}