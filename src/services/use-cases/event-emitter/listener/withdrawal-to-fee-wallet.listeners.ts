import { Injectable, Logger } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import { IDataServices, INotificationServices } from "src/core/abstracts"
import { IHttpServices } from "src/core/abstracts/http-services.abstract"
import { WithdrawalLib } from "../../withdrawal/withdrawal.lib"
import * as _ from "lodash"
import { env, TATUM_BASE_URL, TATUM_CONFIG } from "src/configuration"
import { EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION, EXTERNAL_DEPOSIT_CHANNEL_LINK } from "src/lib/constants"
import { IErrorReporter } from "src/core/types/error"
import { UtilsServices } from "../../utils/utils.service"

const ethBaseDivisorInWei = 1000000000000000000
const tronBaseDivisor = 1000000
const tronFeeAmount = '15'

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
        private readonly utils: UtilsServices
    ) { }


    @OnEvent('send.to.eth.fee.wallet', { async: true })
    async toEthFeeWWallet(event: {
        amount: number,
        privateKey: string,
        from: string,
        email: string
    }) {
        const { amount, privateKey, from, email } = event
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
            console.log("GAS LIMIT", gasLimit)
            console.log("ESTIMATIONS", estimations)

            const { standard: gasPriceBeforeConversion } = estimations
            console.log("GAS PRICE BEFORE CONVERSION", gasPriceBeforeConversion)

            let gasPrice = _.divide(Number(gasPriceBeforeConversion), ethBaseDivisorInWei)
            gasPrice = gasPrice.toFixed(18)
            console.log("GAS PRICE AFTRE CONVERSION", gasPrice)
            const ethFee = { gasLimit, gasPrice: String(gasPrice) }
            const amountAfterDeduction = _.subtract(amount, gasPrice)

            const transfer = await this.withdrawalLib.withdrawalV3({
                destination: coinFeeWallet.address,
                amount: String(amountAfterDeduction),
                privateKey,
                coin: 'ETH',
                ethFee
            })

            // emit to discord
            await this.discord.inHouseNotification({
                title: `Deposit To Fee Wallet From External Deposit of Users :- ${env.env} environment`,
                message: `
        
                COIN:- ETH 

                Amount before deduction:-  ${amount}  
                
                Amount After Deduction:-  ${amountAfterDeduction}
                
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

            const { slow } = await this.http.post(
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

            const fee = Math.abs(Number(slow))
            const amountAfterDeduction = _.subtract(amount, fee)

            const transfer = await this.withdrawalLib.withdrawalV3({
                destination: coinFeeWallet.address,
                amount: String(amountAfterDeduction),
                privateKey,
                coin: 'BTC',
                from,
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
            const gasPrice = _.divide(Number(gasPriceBeforeConversion), ethBaseDivisorInWei)
            const ethFee = { gasLimit, gasPrice: String(gasPrice) }

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
                throw new Error("Fee Wallet does not exists")
            }
            if (!coinFeeWallet) {
                // send notification to discord
                throw new Error("Fee Wallet does not exists")
            }
            const getTrxBalance = await this.http.get(
                `${TATUM_BASE_URL}/tron/account/${masterTronWallet.address}`,

                TATUM_CONFIG
            )
            const masterTrxBalance = _.divide(getTrxBalance.balance, tronBaseDivisor)
            // send tron to activate wallet
            if (masterTrxBalance < Number(tronFeeAmount)) {
                await this.withdrawalLib.withdrawalV3({
                    coin: 'TRON',
                    amount: tronFeeAmount,
                    destination: from,
                    from: masterTronWallet.address,
                    privateKey: masterTronWallet.privateKey
                })
            }
            // check if master wallet has enough tron
            // check if user has enough trx to cover transaction i.e trx should be greater than 13
            // transfer from trx master wallet to user wallet
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
            const gasPrice = _.divide(Number(gasPriceBeforeConversion), ethBaseDivisorInWei)
            const ethFee = { gasLimit, gasPrice: String(gasPrice) }

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
}



