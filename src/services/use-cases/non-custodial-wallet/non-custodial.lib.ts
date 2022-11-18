import { Injectable } from "@nestjs/common";
import { TatumEthSDK } from '@tatumio/eth'
import { env, TATUM_API_KEY } from "src/configuration";
import { TatumTronSDK } from '@tatumio/tron'
import { TatumBtcSDK } from "@tatumio/btc";
import { decryptData, encryptData } from "src/lib/utils";
// import { TatumBscSDK } from '@tatumio/bsc'

const API_KEY_CONFIG = {
    apiKey: TATUM_API_KEY
}
const NETWORK_CONFIG = { testnet: !env.isProd }
@Injectable()
export class NonCustodialWalletLib {
    constructor() { }


    async generateEthWallet(payload: { username: string, userId: string, pin: string }) {
        try {
            const { username, userId, pin } = payload
            const ethSDK = TatumEthSDK(API_KEY_CONFIG)
            const { mnemonic, xpub } = await ethSDK.wallet.generateWallet(undefined, NETWORK_CONFIG)

            const privateKey = await ethSDK.wallet.generatePrivateKeyFromMnemonic(mnemonic, 1, NETWORK_CONFIG)
            const account = await ethSDK.ledger.account.create({
                currency: 'ETH',
                xpub,
            })
            // create account from db

            // if (env.isProd) {
            //     await ethSDK.subscriptions.createSubscription({
            //         type: "ACCOUNT_INCOMING_BLOCKCHAIN_TRANSACTION",
            //         "attr": {
            //             "id": account.id,
            //             "url": `${PROD_API_URL}/api/v1/webhook/tatum-incoming-transaction`
            //         }
            //     })
            //     await ethSDK.subscriptions.createSubscription({
            //         type: "ACCOUNT_PENDING_BLOCKCHAIN_TRANSACTION",
            //         "attr": {
            //             "id": account.id,
            //             "url": `${PROD_API_URL}/api/v1/webhook/tatum-pending-transaction`
            //         }
            //     })

            // }
            const encrypted = encryptData({ text: mnemonic, username, userId, pin })
            const decrypted = decryptData({ text: encrypted, username, userId, pin })

            return {
                account,
                privateKey,
                seed: mnemonic,
                encrypted,
                decrypted
            }
        } catch (error) {
            throw new Error(error)
        }
    }

    async generateTronWallet() {
        try {
            const tronSDK = TatumTronSDK(API_KEY_CONFIG)
            const { mnemonic, xpub } = await tronSDK.wallet.generateWallet()

            const privateKey = await tronSDK.wallet.generatePrivateKeyFromMnemonic(mnemonic, 0)
            const account = await tronSDK.ledger.account.create({
                currency: 'TRON',
                xpub,
            })
            return {
                account,
                privateKey,
                seed: mnemonic
            }
        } catch (error) {
            throw new Error(error)
        }
    }

    async generateBtcWallet() {
        try {

            const btcSDK = TatumBtcSDK(API_KEY_CONFIG)
            const { mnemonic, xpub } = await btcSDK.wallet.generateWallet()

            const privateKey = await btcSDK.wallet.generatePrivateKeyFromMnemonic(mnemonic, 1, NETWORK_CONFIG)
            const account = await btcSDK.ledger.account.create({
                currency: 'BTC',
                xpub,
            })

            return {
                account,
                privateKey,
                seed: mnemonic
            }

        } catch (error) {
            throw new Error(error)
        }
    }

}
