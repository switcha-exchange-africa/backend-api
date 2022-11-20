import { Injectable } from "@nestjs/common"
import { TatumBtcSDK } from "@tatumio/btc"
import { TatumEthSDK } from "@tatumio/eth"
import { TatumTronSDK } from "@tatumio/tron"
import { env } from "process"
import { TATUM_API_KEY, TATUM_BTC_MNEMONIC, TATUM_BTC_XPUB_KEY, TATUM_ETH_MNEMONIC, TATUM_TRON_MNEMONIC } from "src/configuration"
import { Currency } from '@tatumio/api-client'

const API_KEY_CONFIG = {
    apiKey: TATUM_API_KEY
}
const NETWORK_CONFIG = { testnet: !env.isProd }

@Injectable()
export class WithdrawalLib {
    constructor() { }
    async withdrawal(payload: {
        accountId: string,
        coin: string,
        amount: string,
        destination: string
    }) {
        try {
            const { accountId, coin, amount, destination } = payload
            if (coin === Currency.BTC) {
                const btcSDK = TatumBtcSDK(API_KEY_CONFIG)
                const transfer = await btcSDK.virtualAccount.send({
                    senderAccountId: accountId,
                    amount: amount,
                    mnemonic: TATUM_BTC_MNEMONIC,
                    xpub: TATUM_BTC_XPUB_KEY,
                    address: destination,
                    fee: '0.00001',
                })

                return transfer
            }

            if (coin === Currency.ETH || coin === Currency.USDT || coin === Currency.USDC) {

                const ethSDK = TatumEthSDK(API_KEY_CONFIG)
                const privateKey = await ethSDK.wallet.generatePrivateKeyFromMnemonic(TATUM_ETH_MNEMONIC, 1, NETWORK_CONFIG)
                console.log(TATUM_ETH_MNEMONIC)
                console.log(privateKey)
                const transfer = await ethSDK.virtualAccount.send({
                    senderAccountId: accountId,
                    amount,
                    privateKey,
                    address: destination,
                })
                return transfer
            }
            if (coin === Currency.USDT_TRON || coin === Currency.TRON) {
                const tronSDK = TatumTronSDK(API_KEY_CONFIG)
                const fromPrivateKey = await tronSDK.wallet.generatePrivateKeyFromMnemonic(TATUM_TRON_MNEMONIC, 0)

                const transfer = await tronSDK.virtualAccount.send({
                    senderAccountId: accountId,
                    amount,
                    fromPrivateKey,
                    address: destination,
                })
                return transfer
            }
        } catch (error) {
            throw new Error(error)
        }
    }
}