import { IHttpServices } from "src/core/abstracts/http-services.abstract";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import { ForbiddenRequestException } from "../user/exceptions";
import { ResponsesType } from "src/core/types/response";

const CURRENCY_IDS: string = "bitcoin,ethereum,ripple,stellar,celo";
const COINGGECKO_BASE_URL: string = "https://api.coingecko.com/api/v3";
const VS_CURRENCY: string = "ngn";
const ORDER: string = "market_cap_desc";
const PERPAGE: number = 100;
const PAGE = 1;
const SPARKLINE: boolean = false;
// e.g 1h, 24h, 7d, 30d
const price_change_percentage = "24h";
const config = {
  headers: {
    "Content-Type": "application/json",
  },
};

@Injectable()
export class RatesServices {
  constructor(private http: IHttpServices) { }

  async findAll(): Promise<ResponsesType<any>> {
    try {
      const url = `${COINGGECKO_BASE_URL}/simple/price?ids=${CURRENCY_IDS}&vs_currencies=${VS_CURRENCY}`;

      const rates = await this.http.get(url, config);
      return Promise.resolve({
        message: "Rates retrieved successfully",
        status: 200,
        data: rates,
      });
    } catch (error) {
      Logger.error(error)
      if (error.name === 'TypeError') throw new HttpException(error.message, 500)
      throw error;
    }
  }

  async findOne(asset: string): Promise<ResponsesType<any>> {
    const supportedAssetsList = [
      "bitcoin",
      "ethereum",
      "stellar",
      "ripple",
      "celo",
    ];
    try {
      if (!supportedAssetsList.includes(asset))
        throw new ForbiddenRequestException("Asset is not supported yet");
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${asset}&vs_currencies=ngn`;
      const rate = await this.http.get(url, config);
      return Promise.resolve({
        message: `${asset} rate retrieved successfully`,
        status: 200,
        data: rate,
      });
    } catch (error) {
      Logger.error(error)
      if (error.name === 'TypeError') throw new HttpException(error.message, 500)
      throw error;
    }
  }
  async allCryptoMarketCharts(): Promise<ResponsesType<any>> {
    try {
      const url = `${COINGGECKO_BASE_URL}/coins/markets?vs_currency=${VS_CURRENCY}&ids=${CURRENCY_IDS}&order=${ORDER}&per_page=${PERPAGE}&page=${PAGE}&sparkline=${SPARKLINE}&price_change_percentage=${price_change_percentage}`;
      const data = await this.http.get(url, config);
      return Promise.resolve({
        message: `data retrieved successfully`,
        status: 200,
        data,
      });
    } catch (error) {
      Logger.error(error)
      if (error.name === 'TypeError') throw new HttpException(error.message, 500)
      throw error;
    }
  }

  async cryptoMarketCharts(
    base: string,
    coin: string,
    priceChangePercentage: string
  ): Promise<ResponsesType<any>> {
    const url = `${COINGGECKO_BASE_URL}/coins/markets?vs_currency=${base}&ids=${coin}&order=${ORDER}&per_page=${PERPAGE}&page=${PAGE}&sparkline=${SPARKLINE}&price_change_percentage=${priceChangePercentage}`;
    try {
      const data = await this.http.get(url, config);
      return Promise.resolve({
        message: `data retrieved successfully`,
        status: 200,
        data,
      });
    } catch (error) {
      Logger.error(error)
      if (error.name === 'TypeError') throw new HttpException(error.message, 500)
      throw error;
    }
  }

  async cryptoPrices(payload: { base: string, coin: string, days: string, interval: string }): Promise<ResponsesType<any>> {
    const url = `${COINGGECKO_BASE_URL}/coins/${payload.coin}/market_chart?vs_currency=${payload.base}&days=${payload.days}&interval=${payload.interval}`;
    try {
      const data = await this.http.get(url, config);
      return Promise.resolve({ message: `data retrieved successfully`, status: 200, data });
    } catch (error) {
      Logger.error(error)
      if (error.name === 'TypeError') throw new HttpException(error.message, 500)
      throw error;
    }
  }
}
