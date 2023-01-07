import { Injectable } from "@nestjs/common";
import { TatumEthSDK } from '@tatumio/eth'
import { env, ERC_20_TOKENS, TATUM_API_KEY, TATUM_BTC_MNEMONIC, TATUM_ETH_MNEMONIC, TATUM_TRON_MNEMONIC } from "src/configuration";
import { TatumTronSDK } from '@tatumio/tron'
import { TatumBtcSDK } from "@tatumio/btc";
// import { TatumBscSDK } from '@tatumio/bsc'
// import { Currency } from '@tatumio/api-client'
import { encryptData } from "src/lib/utils";

const API_KEY_CONFIG = {
    apiKey: TATUM_API_KEY
}
const NETWORK_CONFIG = { testnet: !env.isProd }

@Injectable()
export class WalletLib {
    constructor() { }

    async  generatePrivateKey(payload: { coin: string, username: string, userId: string, password: string, index: number }) {
        try {
            const { coin, username, userId, password, index } = payload
            if (coin.toUpperCase() === 'ETH' || ERC_20_TOKENS.includes(coin.toUpperCase())) {
                const ethSDK = TatumEthSDK(API_KEY_CONFIG)
                const privateKey = await ethSDK.wallet.generatePrivateKeyFromMnemonic(TATUM_ETH_MNEMONIC, index, NETWORK_CONFIG)
                const encrypted = encryptData({ text: privateKey, username, userId, pin: password })
                return encrypted
            }

            if (coin.toUpperCase() === 'BTC') {
                const btcSDK = TatumBtcSDK(API_KEY_CONFIG)
                const privateKey = await btcSDK.wallet.generatePrivateKeyFromMnemonic(TATUM_BTC_MNEMONIC, index, NETWORK_CONFIG)
                const encrypted = encryptData({ text: privateKey, username, userId, pin: password })
                return encrypted

            }

            if (coin.toUpperCase() === 'TRON' || coin.toUpperCase() === 'USDT_TRON') {
                const tronSDK = TatumTronSDK(API_KEY_CONFIG)
                const privateKey = await tronSDK.wallet.generatePrivateKeyFromMnemonic(TATUM_TRON_MNEMONIC, index)
                const encrypted = encryptData({ text: privateKey, username, userId, pin: password })
                return encrypted
            }
            // if (coin === 'BSC') {
            //     const bscSdk = TatumBscSDK(API_KEY_CONFIG)

            //     const privateKey = await bscSdk.wallet.generatePrivateKeyFromMnemonic(mnemonic, 1, NETWORK_CONFIG)

            //     const encrypted = encryptData({ text: privateKey, username, userId, pin: password })

            // }
            return ''

        } catch (error) {
            throw new Error(error)
        }
    }
}
