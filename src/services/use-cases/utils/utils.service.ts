import { Injectable, Logger } from '@nestjs/common';
import { IDataServices } from 'src/core/abstracts';
import { CoinType, FiatCoinType, ISwap, StableCoins, SwapableCoins } from 'src/core/types/coin';
import * as _ from "lodash"
import { ActivityAction } from 'src/core/dtos/activity';
import { Fee } from 'src/core/entities/Fee';
import * as mongoose from "mongoose";
import { IFeeAmountType } from 'src/core/dtos/fee';
import { env, MAILJET_API_PUBLIC_KEY, MAILJET_API_SECRET_KEY, TATUM_BTC_MNEMONIC, TATUM_BTC_XPUB_KEY, TATUM_ETH_MNEMONIC } from 'src/configuration';
import { IHttpServices } from 'src/core/abstracts/http-services.abstract';

export const ERC_20_TOKENS = ['USDT', 'USDC']
@Injectable()
export class UtilsServices {
  constructor(
    private data: IDataServices,
    private http: IHttpServices

  ) { }


  isStableCoin(coin: CoinType): boolean {
    try {
      if (StableCoins.includes(coin)) return true
      return false
    } catch (error) {
      throw new Error(error)
    }
  }

  convertToUsd(coin: CoinType): FiatCoinType | CoinType {
    try {

      if (StableCoins.includes(coin)) return FiatCoinType.USD
      return coin

    } catch (error) {
      throw new Error(error)
    }
  }

  isSwapableCoin(coin: CoinType): boolean {
    try {
      if (SwapableCoins.includes(coin)) return true
      return false
    } catch (error) {
      throw new Error(error)
    }
  }


  /**
 *  Util function for handling our crypto conversion and swaps
 */

  async swap(payload: ISwap): Promise<{ rate: number, destinationAmount: number }> {
    try {
      const { source, amount, destination } = payload
      if (source === destination) {
        const destinationAmount = amount * 1
        return { rate: 1, destinationAmount }
      }

      if (this.isStableCoin(destination as CoinType)) {
        console.log("HE YEAH")
        const sourceExchangeRate = await this.data.exchangeRates.findOne({ coin: source.toUpperCase() }, null, { sort: 'desc' })
        if (!sourceExchangeRate) throw new Error(`Exchange rate not set for source currency ${source}`)

        console.log(sourceExchangeRate)
        const destinationAmount = _.floor(_.multiply(sourceExchangeRate.sellRate, amount), 3)
        return { rate: sourceExchangeRate.sellRate, destinationAmount }

      }

      const [sourceExchangeRate, destinationExchangeRate] = await Promise.all([
        this.data.exchangeRates.findOne({ coin: source.toUpperCase() }, null, { sort: 'desc' }),
        this.data.exchangeRates.findOne({ coin: destination.toUpperCase() }, null, { sort: 'desc' }),
      ])

      if (!sourceExchangeRate) throw new Error(`Exchange rate not set for source currency ${source}`)
      if (!destinationExchangeRate) throw new Error(`Exchange rate not set for destination currency ${destination}`)

      console.log(sourceExchangeRate)
      console.log(destinationExchangeRate)

      const conversionRate = _.divide(sourceExchangeRate.buyRate, destinationExchangeRate.buyRate)
      const destinationAmount = _.floor(_.multiply(conversionRate, amount), 3)

      return { rate: conversionRate, destinationAmount }

    } catch (error) {
      throw new Error(error)
    }
  }

  /**
   *  Util function for calculating our fees
   */
  async calculateFees(payload: {
    operation: ActivityAction,
    amount: number
  }) {
    try {

      const { operation, amount } = payload

      const getFee: mongoose.HydratedDocument<Fee> = await this.data.fees.findOne({ feature: operation })
      if (!getFee) return { fee: 0, deduction: amount }

      if (getFee.amountType === IFeeAmountType.PERCENTAGE) {
        const fee = _.multiply(amount, _.divide(getFee.amountInPercentage, 100))
        const deduction = _.subtract(amount, fee)
        return { deduction, fee }
      }

      return { fee: 0, deduction: amount }
    } catch (error) {
      throw new Error(error)
    }
  }

  async sendEmailUsingMailjet(payload: {
    fromEmail: string,
    fromName: string,
    toEmail: string,
    toName: string,
    templateId: string,
    subject: string,
    variables?: Record<string, any>

  }) {
    try {

      const { fromEmail, fromName, templateId, subject, variables, toEmail, toName } = payload
      const CONFIG = {
        auth: {
          username: MAILJET_API_PUBLIC_KEY,
          password: MAILJET_API_SECRET_KEY,
        },
      }
      if (env.isProd) {
        const response = await this.http.post(
          'https://api.mailjet.com/v3.1/send',
          {
            "Messages": [
              {
                "From": {
                  "Email": fromEmail,
                  "Name": fromName
                },
                "To": [
                  {
                    "Email": toEmail,
                    "Name": toName
                  }
                ],
                "TemplateID": templateId,
                "TemplateLanguage": true,
                "Subject": subject,
                "Variables": { ...variables }
              }
            ]
          },
          CONFIG
        )
        Logger.log(JSON.stringify(response))
        return response
      }

      Logger.log('Email Sent')
      return 'Email Sent'

    } catch (error) {
      console.error(error)
      throw new Error(error)
    }
  }

  async calculateWithdrawalFees(payload: { coin: string, amount: number }) {
    try {
      const { coin, amount } = payload
      const getFeeAmount = await this.data.coinWithdrawalFee.findOne({ coin })
      const withdrawableAmount = Math.abs(_.subtract(amount, Math.abs(getFeeAmount.fee)))
      return {
        fee: getFeeAmount.fee,
        amount: withdrawableAmount
      }
    } catch (error) {
      throw new Error(error)
    }
  }

  cleanUpPayloadForTatumWithdrawal(payload: { coin: string, accountId: string, address: string, amount: number }) {
    try {
      const { coin, accountId, amount, address } = payload
      if (coin === 'BTC') {
        return {
          url: '/v3/offchain/bitcoin/transfer',
          payload: {
            senderAccountId: accountId,
            address,
            amount: `${amount}`,
            mnemonic: TATUM_BTC_MNEMONIC,
            xpub: TATUM_BTC_XPUB_KEY
          }
        }
      }
      if (ERC_20_TOKENS.includes(coin)) {
        return {
          url: '/v3/offchain/ethereum/erc20/transfer',
          payload: {
            senderAccountId: accountId,
            address,
            amount: `${amount}`,
            mnemonic: TATUM_ETH_MNEMONIC,
            "index": 0
          }
        }
      }
      if (coin === 'ETH') {
        return {
          url: '/v3/offchain/ethereum/transfer',
          payload: {
            senderAccountId: accountId,
            address,
            amount: `${amount}`,
            mnemonic: TATUM_ETH_MNEMONIC,
            "index": 0
          }
        }
      }
      return {}
    } catch (error) {
      throw new Error(error)
    }
  }
}

