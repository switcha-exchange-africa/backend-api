import { Injectable, Logger } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { IDataServices, INotificationServices } from "src/core/abstracts"
import { IHttpServices } from "src/core/abstracts/http-services.abstract"
import { WithdrawalLib } from "../../withdrawal/withdrawal.lib"
import * as _ from "lodash"
import { BASE_DIVISOR_IN_GWEI, env, TATUM_BASE_URL, TATUM_CONFIG, TATUM_PRIVATE_KEY_PIN, TATUM_PRIVATE_KEY_USER_ID, TATUM_PRIVATE_KEY_USER_NAME, TRC_20_TRON_FEE_AMOUNT } from "src/configuration"
import { EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION, EXTERNAL_DEPOSIT_CHANNEL_LINK } from "src/lib/constants"
import { IErrorReporter } from "src/core/types/error"
import { Trc20TokensContractAddress, UtilsServices } from "../../utils/utils.service"
import { decryptData } from "src/lib/utils"
import { BlockchainFeesAccruedFactoryServices } from "../../fees/fee-factory.service"

const ethBaseDivisorInWei = 1000000000000000000

const tronBaseDivisor = 1000000

export enum ERC_20_TOKENS_ADDRESS {
    USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
}

@Injectable()
export class WithdrawalToFeeWalletListener {
    constructor(
        private readonly withdrawalLib: WithdrawalLib,
        private readonly data: IDataServices,
        private readonly http: IHttpServices,
        private readonly discord: INotificationServices,
        private readonly utils: UtilsServices,
        private readonly blockchainFeesAccured: BlockchainFeesAccruedFactoryServices
    ) { }


    @OnEvent('send.to.eth.fee.wallet', { async: true })
    async toEthFeeWWallet(event: {
        amount: number,
        privateKey: string,
        from: string,
        email: string,
        userId: string,
        walletId: string
    }) {
        const { amount, privateKey, from, email, userId, walletId } = event
        try {
            const coinFeeWallet = await this.data.feeWallets.findOne({ coin: 'ETH' })
            if (!coinFeeWallet) {
                throw new Error("Fee Wallet does not exists")
            }

            const { gasLimit, estimations } = await this.http.post(
                `${TATUM_BASE_URL}/ethereum/gas`,
                {

                    from,
                    to: coinFeeWallet.address,
                    amount
                },
                TATUM_CONFIG
            )
            const { fast: gasPriceBeforeConversion } = estimations

            let gasPriceConvertToEth = _.divide(Number(gasPriceBeforeConversion), ethBaseDivisorInWei)
            gasPriceConvertToEth = gasPriceConvertToEth.toFixed(18)

            const amountAfterDeduction = _.subtract(amount, gasPriceConvertToEth)

            const convertGasPriceToGwei = _.divide(Number(gasPriceBeforeConversion), BASE_DIVISOR_IN_GWEI)
            const gasPrice = String(convertGasPriceToGwei)
            const ethFee = { gasLimit, gasPrice }

            const transfer = await this.withdrawalLib.withdrawalV3({
                destination: coinFeeWallet.address,
                amount: String(amountAfterDeduction),
                privateKey,
                coin: 'ETH',
                ethFee
            })
            const blockchainFeeAccuredFactory = await this.blockchainFeesAccured.create({
                action: 'deposit',
                coin: 'ETH',
                fee: gasPriceConvertToEth,
                description: '',
                userId,
                walletId,
            })
            await this.data.blockchainFeesAccured.create(blockchainFeeAccuredFactory)

            // emit to discord
            await this.discord.inHouseNotification({
                title: `Deposit To Fee Wallet From External Deposit of Users :- ${env.env} environment`,
                message: `
        
                COIN:- ETH 

                Amount before deduction:-  ${amount}  
                
                Amount After Deduction:-  ${amountAfterDeduction}
                
                // Gas Limit :- ${gasLimit}
        
                // Gas Price :- ${gasPrice} GWEI
        
                From:- ${from}
                
                TX ID: ${typeof transfer === "string" ? transfer : JSON.stringify(transfer)

                    }
                `,
                link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
            })
            return transfer
        } catch (error) {
            Logger.error(error)

            const errorPayload: IErrorReporter = {
                action: 'Deposit To Fee Wallet From External Deposit of Users',
                error,
                email,
                message: error.message
            }
            this.utils.errorReporter(errorPayload)
        }
    }


    @OnEvent('send.to.btc.fee.wallet', { async: true })
    async toBtcFeeWWallet(event: {
        amount: number,
        privateKey: string,
        from: string,
        email: string
    }) {
        const { amount, privateKey, from, email } = event
        try {
            const coinFeeWallet = await this.data.feeWallets.findOne({ coin: 'BTC' })
            if (!coinFeeWallet) {
                throw new Error("Fee Wallet does not exists")
            }

            const { fast } = await this.http.post(
                `${TATUM_BASE_URL}/blockchain/estimate`,
                {

                    chain: "BTC",
                    type: "TRANSFER",
                    fromAddress: [
                        from
                    ],
                    to: [
                        {
                            address: coinFeeWallet.address,
                            value: amount
                        }
                    ]
                },
                TATUM_CONFIG
            )

            const fee = Math.abs(Number(fast))
            const amountAfterDeduction = _.subtract(amount, fee)

            const transfer = await this.withdrawalLib.withdrawalV3({
                destination: coinFeeWallet.address,
                amount: String(amountAfterDeduction),
                privateKey,
                coin: 'BTC',
                from,
                fee: String(fee),
                changeAddress: coinFeeWallet.address,
            })

            // emit to discord
            await this.discord.inHouseNotification({
                title: `Deposit To Fee Wallet From External Deposit of Users :- ${env.env} environment`,
                message: `
        
                Coin:- BTC

                Amount before deduction:-  ${amount}  
                
                Amount After Deduction:-  ${amountAfterDeduction}
                
                Gas Fee :- ${fee}
                
                From:- ${from}
                
                TX ID: ${typeof transfer === "string" ? transfer : JSON.stringify(transfer)

                    }
                `,
                link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
            })

            return transfer
        } catch (error) {
            Logger.error(error)

            const errorPayload: IErrorReporter = {
                action: 'Deposit To Fee Wallet From External Deposit of Users',
                error,
                email,
                message: error.message
            }
            this.utils.errorReporter(errorPayload)
        }
    }

    @OnEvent('send.to.erc20.fee.wallet', { async: true })
    async toErc20FeeWWallet(event: {
        amount: number,
        privateKey: string,
        from: string,
        email: string,
        coin: string
    }) {
        const { amount, privateKey, from, email, coin } = event
        try {
            const coinFeeWallet = await this.data.feeWallets.findOne({ coin: coin })
            if (!coinFeeWallet) {
                throw new Error("Fee Wallet does not exists")
            }

            const { gasLimit, estimations } = await this.http.post(
                `${TATUM_BASE_URL}/ethereum/gas`,
                {

                    from,
                    to: coinFeeWallet.address,
                    amount,
                    contractAddress: coin === 'USDT' ? ERC_20_TOKENS_ADDRESS.USDT : ERC_20_TOKENS_ADDRESS.USDC

                },
                TATUM_CONFIG
            )

            const { standard: gasPriceBeforeConversion } = estimations
            // const gasPrice = _.divide(Number(gasPriceBeforeConversion), ethBaseDivisorInWei)
            const ethFee = { gasLimit, gasPrice: String(gasPriceBeforeConversion) }

            const transfer = await this.withdrawalLib.withdrawalV3({
                destination: coinFeeWallet.address,
                amount: String(amount),
                privateKey,
                coin: 'ETH',
                ethFee
            })

            // emit to discord
            await this.discord.inHouseNotification({
                title: `Deposit To Fee Wallet From External Deposit of Users :- ${env.env} environment`,
                message: `
        
                COIN:- ${coin} 

                Amount before deduction:-  ${amount}  
                                
                Gas Limit :- ${gasLimit}
        
                Gas Price :- ${gasLimit}
        
                From:- ${from}
                
                TX ID: ${typeof transfer === "string" ? transfer : JSON.stringify(transfer)

                    }
                `,
                link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
            })
            return transfer
        } catch (error) {
            Logger.error(error)

            const errorPayload: IErrorReporter = {
                action: 'Deposit To Fee Wallet From External Deposit of Users',
                error,
                email,
                message: error.message
            }
            this.utils.errorReporter(errorPayload)
        }
    }




    @OnEvent('send.to.trc20.fee.wallet', { async: true })
    async toTrc20FeeWWallet(event: {
        amount: number,
        privateKey: string,
        from: string,
        email: string,
        coin: string
    }) {
        const { amount, privateKey, from, email, coin } = event
        try {
            const [masterTronWallet, coinFeeWallet] = await Promise.all([
                this.data.feeWallets.findOne({ coin: 'TRON' }),
                this.data.feeWallets.findOne({ coin: 'USDT_TRON' })
            ])

            if (!masterTronWallet) {
                // send notification to discord
                Logger.error('send.to.trc20.fee.wallet', 'Master Tron wallet does not exists')
                throw new Error(`Master Tron wallet does not exists`)
            }
            if (!coinFeeWallet) {
                // send notification to discord
                Logger.error('send.to.trc20.fee.wallet', 'USDT_TRON fee wallet does not exists')

                throw new Error(`USDT_TRON fee wallet does not exists`)
            }

            // get master tron balance
            const getMasterTrxBalance = await this.http.get(
                `${TATUM_BASE_URL}/tron/account/${masterTronWallet.address}`,

                TATUM_CONFIG
            )
            const fromTrxBalance = await this.http.get(
                `${TATUM_BASE_URL}/tron/account/${from}`,

                TATUM_CONFIG
            )

            const masterTrxBalance = _.divide(getMasterTrxBalance.balance, tronBaseDivisor)
            const fromTrxBalanceConversionBalance = _.divide(fromTrxBalance.balance, tronBaseDivisor)

            if (masterTrxBalance < Number(TRC_20_TRON_FEE_AMOUNT)) {
                Logger.error('send.to.trc20.fee.wallet', `Master tron balance is less than ${TRC_20_TRON_FEE_AMOUNT}`)
                throw new Error(`Master tron balance is less than ${TRC_20_TRON_FEE_AMOUNT}`)
            }
            // send tron to activate wallet
            if (fromTrxBalanceConversionBalance < Number(TRC_20_TRON_FEE_AMOUNT)) {
                // if balance is less than the fee send from tron master address to from address
                const masterTronWalletPrivateKey = decryptData({
                    text: masterTronWallet.privateKey,
                    username: TATUM_PRIVATE_KEY_USER_NAME,
                    userId: TATUM_PRIVATE_KEY_USER_ID,
                    pin: TATUM_PRIVATE_KEY_PIN
                })
                await this.withdrawalLib.withdrawalV3({
                    coin: 'TRON',
                    amount: TRC_20_TRON_FEE_AMOUNT,
                    destination: from,
                    from: masterTronWallet.address,
                    privateKey: masterTronWalletPrivateKey
                })
            }

            // send to coin fee wallet
            const transfer = await this.withdrawalLib.withdrawalV3({
                destination: coinFeeWallet.address,
                amount: String(amount),
                privateKey,
                coin: 'USDT_TRON',
                contractAddress: Trc20TokensContractAddress.USDT_TRON,
                fee: String(TRC_20_TRON_FEE_AMOUNT)
            })

            // emit to discord
            await this.discord.inHouseNotification({
                title: `Deposit To Fee Wallet From External Deposit of Users :- ${env.env} environment`,
                message: `
        
                COIN:- ${coin} 

                Amount before deduction:-  ${amount}  
                                
        
                From:- ${from}
                
                TX ID: ${typeof transfer === "string" ? transfer : JSON.stringify(transfer)

                    }
                `,
                link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
            })
            return transfer
        } catch (error) {
            Logger.error(error)

            const errorPayload: IErrorReporter = {
                action: 'Deposit To Fee Wallet From External Deposit of Users',
                error,
                email,
                message: error.message
            }
            this.utils.errorReporter(errorPayload)
        }
    }
}



