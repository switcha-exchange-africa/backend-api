import { Injectable } from "@nestjs/common";
import { TatumEthSDK } from '@tatumio/eth'
import { env, TATUM_API_KEY } from "src/configuration";
import { TatumTronSDK } from '@tatumio/tron'
import { TatumBtcSDK } from "@tatumio/btc";
import { TatumBscSDK } from '@tatumio/bsc'
import { Currency } from '@tatumio/api-client'
import { decryptData, encryptData } from "src/lib/utils";
import { CoinType } from "src/core/types/coin";

const API_KEY_CONFIG = {
    apiKey: TATUM_API_KEY
}
const NETWORK_CONFIG = { testnet: !env.isProd }
@Injectable()
export class VirtualAccountLib {
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

            const encrypted = encryptData({ text: mnemonic, username, userId, pin })
            const decrypted = decryptData({ text: encrypted, username, userId, pin })
            // await ethSDK.subscriptions.
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
    async generateERC20Wallet(payload: { username: string, userId: string, pin: string, coin: string }) {
        try {
            const { username, userId, pin, coin } = payload
            const ethSDK = TatumEthSDK(API_KEY_CONFIG)
            const { mnemonic, xpub } = await ethSDK.wallet.generateWallet(undefined, NETWORK_CONFIG)

            const privateKey = await ethSDK.wallet.generatePrivateKeyFromMnemonic(mnemonic, 1, NETWORK_CONFIG)
            const account = await ethSDK.ledger.account.create({
                currency: coin === CoinType.USDT ? Currency.USDT : Currency.USDC,
                xpub,
            })

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
    async generateTronWallet(payload: { username: string, userId: string, pin: string }) {
        try {
            const { username, userId, pin } = payload
            const tronSDK = TatumTronSDK(API_KEY_CONFIG)
            const { mnemonic, xpub } = await tronSDK.wallet.generateWallet()

            const privateKey = await tronSDK.wallet.generatePrivateKeyFromMnemonic(mnemonic, 0)
            const account = await tronSDK.ledger.account.create({
                currency: Currency.USDT_TRON,
                xpub,
            })
            const encrypted = encryptData({ text: mnemonic, username, userId, pin })

            return {
                account,
                privateKey,
                seed: mnemonic,
                encrypted,
            }
        } catch (error) {
            throw new Error(error)
        }
    }

    async generateBtcDepositAddress(accountId: string) {
        try {
            const btcSDK = TatumBtcSDK(API_KEY_CONFIG)
            const address = await btcSDK.virtualAccount.depositAddress.create(accountId)

            return address
        } catch (error) {
            throw new Error(error)
        }
    }

    async generateBscWallet(payload: { username: string, userId: string, pin: string }) {
        try {
            const { username, userId, pin } = payload

            const bscSdk = TatumBscSDK(API_KEY_CONFIG)
            const { mnemonic, xpub } = await bscSdk.wallet.generateWallet()

            const privateKey = await bscSdk.wallet.generatePrivateKeyFromMnemonic(mnemonic, 1, NETWORK_CONFIG)
            const account = await bscSdk.ledger.account.create({
                currency: 'BSC',
                xpub,
            })
            const encrypted = encryptData({ text: mnemonic, username, userId, pin })

            return {
                account,
                privateKey,
                seed: mnemonic,
                encrypted,
            }
        } catch (error) {
            throw new Error(error)
        }
    }

}


