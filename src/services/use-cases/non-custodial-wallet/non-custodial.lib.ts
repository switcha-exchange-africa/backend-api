import { Injectable } from "@nestjs/common";
import { TatumEthSDK } from '@tatumio/eth'
import { env, TATUM_API_KEY } from "src/configuration";
import { TatumTronSDK } from '@tatumio/tron'
// import { TatumBscSDK } from '@tatumio/bsc'


@Injectable()
export class NonCustodialWalletLib {
    constructor() { }


    async generateEthWallet() {
        try {
            const ethSDK = TatumEthSDK({ apiKey: TATUM_API_KEY })
            const { mnemonic } = await ethSDK.wallet.generateWallet(undefined, { testnet: !env.isProd })

            const fromPrivateKey = await ethSDK.wallet.generatePrivateKeyFromMnemonic(mnemonic, 1, { testnet: true })
            const receiverAddress = await ethSDK.wallet.generateAddressFromPrivateKey(fromPrivateKey)

            return {
                address: receiverAddress,
                privateKey: fromPrivateKey,
                seed: mnemonic
            }
        } catch (error) {
            throw new Error(error)
        }
    }

    async generateTronWallet() {
        try {
            const tronSDK = TatumTronSDK({ apiKey: TATUM_API_KEY })
            const { mnemonic } = await tronSDK.wallet.generateWallet()
            const privateKey = await tronSDK.wallet.generatePrivateKeyFromMnemonic(mnemonic, 0)
            const address = await tronSDK.wallet.generateAddressFromPrivatekey(privateKey)

            return {
                address,
                privateKey: privateKey,
                seed: mnemonic
            }
        } catch (error) {
            throw new Error(error)
        }
    }

}
