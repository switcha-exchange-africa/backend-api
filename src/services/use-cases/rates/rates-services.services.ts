import { IHttpServices } from "src/core/abstracts/http-services.abstract";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import { ForbiddenRequestException } from "../user/exceptions";

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
  constructor(private http: IHttpServices) {}

  async findAll() {
    try {
      const url = `${COINGGECKO_BASE_URL}/simple/price?ids=${CURRENCY_IDS}&vs_currencies=${VS_CURRENCY}`;

      const rates = await this.http.get(url, config);
      return Promise.resolve({
        message: "Rates retrieved successfully",
        status: 200,
        rates,
      });
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }

  async findOne(asset: string) {
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
        rate,
      });
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }
  async allCryptoMarketCharts() {
    try {
      const url = `${COINGGECKO_BASE_URL}/coins/markets?vs_currency=${VS_CURRENCY}&ids=${CURRENCY_IDS}&order=${ORDER}&per_page=${PERPAGE}&page=${PAGE}&sparkline=${SPARKLINE}&price_change_percentage=${price_change_percentage}`;
      const data = await this.http.get(url, config);
      return Promise.resolve({
        message: `data retrieved successfully`,
        status: 200,
        data,
      });
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }

  async cryptoMarketCharts(
    base: string,
    coin: string,
    priceChangePercentage: string
  ) {
    const url = `${COINGGECKO_BASE_URL}/coins/markets?vs_currency=${base}&ids=${coin}&order=${ORDER}&per_page=${PERPAGE}&page=${PAGE}&sparkline=${SPARKLINE}&price_change_percentage=${priceChangePercentage}`;
    try {
      const data = await this.http.get(url, config);
      return Promise.resolve({
        message: `data retrieved successfully`,
        status: 200,
        data,
      });
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }

  async cryptoPrices(
    base: string,
    coin: string,
    days: string,
    interval: string
  ) {
    const url = `${COINGGECKO_BASE_URL}/coins/${coin}/market_chart?vs_currency=${base}&days=${days}&interval=${interval}`;
    try {
      const data = await this.http.get(url, config);
      return Promise.resolve({
        message: `data retrieved successfully`,
        status: 200,
        data,
      });
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }
}
