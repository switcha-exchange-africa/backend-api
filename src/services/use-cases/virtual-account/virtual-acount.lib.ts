import { Injectable } from "@nestjs/common";
import { TatumEthSDK } from '@tatumio/eth'
import { env, TATUM_API_KEY } from "src/configuration";
import { TatumTronSDK } from '@tatumio/tron'
import { TatumBtcSDK } from "@tatumio/btc";
import { TatumBscSDK } from '@tatumio/bsc'
import { Currency } from '@tatumio/api-client'

const API_KEY_CONFIG = {
    apiKey: TATUM_API_KEY
}
const NETWORK_CONFIG = { testnet: !env.isProd }

@Injectable()
export class VirtualAccountLib {
    constructor() { }


    async generateDepositAddress(accountId: string, coin: string) {
        try {
            if (coin === Currency.BTC) {
                const btcSDK = TatumBtcSDK(API_KEY_CONFIG)
                const address = await btcSDK.virtualAccount.depositAddress.create(accountId)
                return address
            }

            if (coin === Currency.ETH) {
                const ethSDK = TatumEthSDK(API_KEY_CONFIG)
                const address = await ethSDK.virtualAccount.depositAddress.create(accountId)
                return address
            }

            if (coin === Currency.USDT_TRON) {
                const tronSDK = TatumTronSDK(API_KEY_CONFIG)
                const address = await tronSDK.virtualAccount.depositAddress.create(accountId)
                return address
            }

            if (coin === Currency.BSC) {
                const bscSdk = TatumBscSDK(API_KEY_CONFIG)
                const address = await bscSdk.virtualAccount.depositAddress.create(accountId)
                return address
            }

            if (coin === Currency.USDC || coin === Currency.USDT) {
                const ethSDK = TatumEthSDK(API_KEY_CONFIG)
                const address = await ethSDK.virtualAccount.depositAddress.create(accountId)
                return address
            }

        } catch (error) {
            throw new Error(error)
        }
    }


    async withdrawal(payload: {
        accountId: string,
        coin: string,
        amount: string,
        destination: string,
        mnemonic?: string,
        xpub?: string
    }) {
        try {
            const { accountId, coin, amount, mnemonic, xpub, destination } = payload
            if (coin === Currency.BTC) {
                const btcSDK = TatumBtcSDK(API_KEY_CONFIG)
                const transfer = await btcSDK.virtualAccount.send({
                    senderAccountId: accountId,
                    amount: amount,
                    mnemonic,
                    xpub,
                    address: destination,
                    fee: '0.00001',
                })

                return transfer
            }

            if (coin === Currency.ETH) {

                const ethSDK = TatumEthSDK(API_KEY_CONFIG)
                const privateKey = await ethSDK.wallet.generatePrivateKeyFromMnemonic(mnemonic, 1, NETWORK_CONFIG)

                const transfer = await ethSDK.virtualAccount.send({
                    senderAccountId: accountId,
                    amount,
                    privateKey,
                    address: destination,
                })
                return transfer
            }
        } catch (error) {
            throw new Error(error)
        }
    }
}


