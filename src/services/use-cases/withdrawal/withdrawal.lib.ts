import { Injectable, Logger } from "@nestjs/common"
import { env, MASTER_TRON_MNEMONIC, TATUM_API_KEY, TATUM_BASE_URL, TATUM_BTC_MNEMONIC, TATUM_BTC_XPUB_KEY, TATUM_CONFIG, TATUM_ETH_MNEMONIC, TATUM_TRON_MNEMONIC } from "src/configuration"
import { Currency } from '@tatumio/api-client'
import { IHttpServices } from "src/core/abstracts/http-services.abstract"
import { TatumBscSDK } from "@tatumio/bsc"
import { TatumBtcSDK } from "@tatumio/btc"
import { TatumEthSDK } from "@tatumio/eth"
import { TatumTronSDK } from "@tatumio/tron"
import { BEP_20_TOKENS, ERC_20_TOKENS, TRC_20_TOKENS } from "../utils/utils.service"
// import { randomFixedInteger } from "src/lib/utils"

const API_KEY_CONFIG = {
    apiKey: TATUM_API_KEY
}
const NETWORK_CONFIG = { testnet: !env.isProd }

type BtcTransactionFromAddress = {
    /**
     * The array of blockchain addresses to send the assets from and their private keys. For each address, the last 100 transactions are scanned for any UTXO to be included in the transaction.
     */
    fromAddress: Array<{
        address: string;
        privateKey: string;
    }>;
    /**
     * The array of blockchain addresses to send the assets to and the amounts that each address should receive (in BTC). The difference between the UTXOs calculated in the <code>fromAddress</code> section and the total amount to receive calculated in the <code>to</code> section will be used as the gas fee. To explicitly specify the fee amount and the blockchain address where any extra funds remaining after covering the fee will be sent, set the <code>fee</code> and <code>changeAddress</code> parameters.
     */
    to: Array<{
        address: string;
        value: number;
    }>;
    /**
     * The fee to be paid for the transaction (in BTC); if you are using this parameter, you have to also use the <code>changeAddress</code> parameter because these two parameters only work together.
     */
    fee?: string;
    /**
     * The blockchain address to send any extra assets remaning after covering the fee to; if you are using this parameter, you have to also use the <code>fee</code> parameter because these two parameters only work together.
     */
    changeAddress?: string;
};
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
                        fee: "0.00001"
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
                    },
                    TATUM_CONFIG
                )
                return transfer
            }

            if (coin === Currency.TRON) {

                const transfer = await this.http.post(
                    `${TATUM_BASE_URL}/offchain/tron/transfer`,
                    {

                        senderAccountId: accountId,
                        address: destination,
                        index,
                        mnemonic: MASTER_TRON_MNEMONIC,
                        amount: String(amount),
                    },
                    TATUM_CONFIG
                )
                return transfer
            }
            if (coin === Currency.USDT_TRON) {

                const transfer = await this.http.post(
                    `${TATUM_BASE_URL}/offchain/tron/transfer`,
                    {

                        senderAccountId: accountId,
                        address: destination,
                        index,
                        mnemonic: TATUM_TRON_MNEMONIC,
                        amount: String(amount),
                        fee: "11.798"
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
            const { accountId, coin, amount, mnemonic, xpub, destination, index } = payload
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

    // withdrawal version 3
    async withdrawalV3(payload: {
        accountId?: string,
        coin?: string,
        amount: string,
        from?: string,
        destination?: string,
        xpub?: string,
        index?: number,
        privateKey: string,
        fee?: string,
        changeAddress?: string,
        ethFee?: { gasLimit: string; gasPrice: string; },
        contractAddress?: string
    }) {
        try {
            const { coin, privateKey, destination, ethFee, amount, from, fee, changeAddress, contractAddress } = payload

            if (coin === Currency.ETH) {
                const ethSDK = TatumEthSDK(API_KEY_CONFIG)

                const transfer = await ethSDK.transaction.send.transferSignedTransaction({
                    to: destination,
                    amount,
                    fromPrivateKey: privateKey,
                    // fee: ethFee,
                    currency: Currency.ETH,
                    // nonce: randomFixedInteger(7)
                })
                return transfer
            }

            if (coin === Currency.BTC) {
                const convertToNumber = Number(amount).toFixed(8)
                const btcSDK = TatumBtcSDK(API_KEY_CONFIG)
                console.log({
                    fromAddress: [
                        {
                            address: from,
                            privateKey: privateKey,
                        },
                    ],
                    to: [
                        {
                            address: destination,
                            value: Number(convertToNumber),
                        },
                    ],
                    fee: fee,
                    changeAddress: changeAddress,
                })
                const transfer = await btcSDK.transaction.sendTransaction({
                    fromAddress: [
                        {
                            address: from,
                            privateKey: privateKey,
                        },
                    ],
                    to: [
                        {
                            address: destination,
                            value: Number(convertToNumber),
                        },
                    ],
                    fee: fee,
                    changeAddress: changeAddress,
                } as unknown as BtcTransactionFromAddress,
                    NETWORK_CONFIG)
                return transfer
            }

            if (ERC_20_TOKENS.includes(coin)) {

                const ethSDK = TatumEthSDK(API_KEY_CONFIG)
                const transfer = await ethSDK.transaction.send.transferSignedTransaction({
                    to: destination,
                    amount,
                    fromPrivateKey: privateKey,
                    fee: ethFee,
                    currency: coin as Currency
                })
                return transfer
            }

            if (BEP_20_TOKENS.includes(coin)) {

                const bscSDK = TatumBscSDK(API_KEY_CONFIG)
                const transfer = await bscSDK.transaction.send.transferSignedTransaction({
                    to: destination,
                    amount,
                    fromPrivateKey: privateKey,
                    fee: ethFee,
                    currency: coin as Currency
                })
                return transfer
            }

            if (TRC_20_TOKENS.includes(coin)) {

                const tronSdk = TatumTronSDK(API_KEY_CONFIG)
                const transfer = await tronSdk.trc20.send.signedTransaction({
                    to: destination,
                    amount,
                    fromPrivateKey: privateKey,
                    tokenAddress: contractAddress,
                    feeLimit: Number(fee) | 15,
                })
                return transfer
            }

            if (coin === 'TRON') {

                const tronSdk = TatumTronSDK(API_KEY_CONFIG)
                const transfer = await tronSdk.transaction.send.signedTransaction({
                    to: destination,
                    amount,
                    fromPrivateKey: privateKey,
                })
                return transfer
            }
        } catch (error) {
            throw new Error(error)
        }
    }
}