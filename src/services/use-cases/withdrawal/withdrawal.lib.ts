import { Injectable, Logger } from "@nestjs/common"
import { env, TATUM_API_KEY, TATUM_BASE_URL, TATUM_BTC_MNEMONIC, TATUM_BTC_XPUB_KEY, TATUM_CONFIG, TATUM_ETH_MNEMONIC, TATUM_TRON_MNEMONIC } from "src/configuration"
import { Currency } from '@tatumio/api-client'
import { IHttpServices } from "src/core/abstracts/http-services.abstract"
import { TatumBscSDK } from "@tatumio/bsc"
import { TatumBtcSDK } from "@tatumio/btc"
import { TatumEthSDK } from "@tatumio/eth"
import { TatumTronSDK } from "@tatumio/tron"

const API_KEY_CONFIG = {
    apiKey: TATUM_API_KEY
}
const NETWORK_CONFIG = { testnet: !env.isProd }


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


    async withdrawalV2(payload: {
        accountId: string,
        coin: string,
        amount: string,
        destination: string,
        mnemonic?: string,
        xpub?: string,
        index: number
    }) {
        try {
            const { accountId, coin, amount, mnemonic, xpub, destination,index } = payload
            console.log(payload)
            
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

            if (coin === Currency.ETH || coin === Currency.USDT || coin === Currency.USDC) {

                const ethSDK = TatumEthSDK(API_KEY_CONFIG)
                const privateKey = await ethSDK.wallet.generatePrivateKeyFromMnemonic(mnemonic, index, NETWORK_CONFIG)

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
                const fromPrivateKey = await tronSDK.wallet.generatePrivateKeyFromMnemonic(mnemonic, index)

                const transfer = await tronSDK.virtualAccount.send({
                    senderAccountId: accountId,
                    amount,
                    fromPrivateKey,
                    address: destination,
                })
                return transfer
            }
            if (coin === Currency.BNB || coin === Currency.BSC || coin === Currency.BUSD) {

                const bscSdk = TatumBscSDK(API_KEY_CONFIG)
                const fromPrivateKey = await bscSdk.wallet.generatePrivateKeyFromMnemonic(mnemonic, index, NETWORK_CONFIG)

                const transfer = await bscSdk.virtualAccount.send({
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