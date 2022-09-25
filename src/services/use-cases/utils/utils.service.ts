import { Injectable } from '@nestjs/common';
import { IDataServices } from 'src/core/abstracts';
import { CoinType, FiatCoinType, IBuy, ISwap, StableCoins, SwapableCoins } from 'src/core/types/coin';
import * as _ from "lodash"

@Injectable()
export class UtilsServices {
  constructor(
    private data: IDataServices,

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

  async swap(payload: ISwap): Promise<{ rate: number, destinationAmount: number }> {
    try {
      const { source, amount, destination } = payload
      if (this.isStableCoin(source as CoinType) && this.isStableCoin(destination as CoinType)) {

        const destinationAmount = amount * 1
        return { rate: 1, destinationAmount }

      }

      if (this.isStableCoin(source as CoinType) || this.isStableCoin(destination as CoinType)) {
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

      const conversionRate = _.divide(sourceExchangeRate.buyRate, destinationExchangeRate.buyRate )
      const destinationAmount = _.floor(_.multiply(conversionRate, amount), 3)

      return { rate: conversionRate, destinationAmount }

    } catch (error) {
      throw new Error(error)
    }
  }

  async buy(payload: IBuy): Promise<{ rate: number, destinationAmount: number }> {
    try {
      const { creditCoin, amount, debitCoin } = payload

      const [sourceExchangeRate, destinationExchangeRate] = await Promise.all([
        this.data.exchangeRates.findOne({ coin: debitCoin.toUpperCase() }, null, { sort: 'desc' }),
        this.data.exchangeRates.findOne({ coin: creditCoin.toUpperCase() }, null, { sort: 'desc' }),
      ])

      if (!sourceExchangeRate) throw new Error(`Exchange rate not set for source currency ${debitCoin}`)
      if (!destinationExchangeRate) throw new Error(`Exchange rate not set for destination currency ${creditCoin}`)


      const conversionRate = _.divide(destinationExchangeRate.buyRate, sourceExchangeRate.sellRate)
      const destinationAmount = _.floor(_.multiply(conversionRate, amount), 3)

      return { rate: conversionRate, destinationAmount }

    } catch (error) {
      throw new Error(error)
    }
  }

}

