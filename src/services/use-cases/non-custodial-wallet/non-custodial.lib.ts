import { Injectable } from "@nestjs/common";

import { TatumEthSDK } from '@tatumio/eth'
import { TATUM_API_KEY } from "src/configuration";


@Injectable()
export class NonCustodialWalletLib {
    constructor() { }


    async generateEthWallet() {
        try {
            const ethSDK = TatumEthSDK({ apiKey: TATUM_API_KEY })
            const {mnemonic, xpub } = await ethSDK.wallet.generateWallet(undefined, { testnet: true })

            // https://apidoc.tatum.io/tag/Ethereum#operation/EthGenerateAddressPrivateKey
            const fromPrivateKey = await ethSDK.wallet.generatePrivateKeyFromMnemonic(mnemonic, 1, { testnet: true })

            // https://apidoc.tatum.io/tag/Ethereum#operation/EthGenerateAddress
            const receiverAddress = await ethSDK.wallet.generateAddressFromXPub(xpub, 0)

            // Generate new virtual account for ETH with specific blockchain address
            // https://apidoc.tatum.io/tag/Account#operation/createAccount
            // const virtualAccount = await ethSDK.ledger.account.create({
            //   currency: 'ETH',
            //   xpub: xpub,
            // })
            // console.log(JSON.stringify(virtualAccount))

            // // create deposit address for a virtual account
            // // https://apidoc.tatum.io/tag/Blockchain-addresses#operation/generateDepositAddress
            // const depositAddress = await ethSDK.virtualAccount.depositAddress.create(virtualAccount.id)

            // console.log(`Deposit address is ${depositAddress.address}`)
            return {
                address: receiverAddress,
                privateKey: fromPrivateKey,
                seed: mnemonic

            }

        } catch (error) {
            throw new Error(error)
        }
    }

}
