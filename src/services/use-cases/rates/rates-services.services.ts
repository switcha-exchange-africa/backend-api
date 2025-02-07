import { IHttpServices } from "src/core/abstracts/http-services.abstract";
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { ResponseState, ResponsesType } from "src/core/types/response";
import { TATUM_API_KEY, TATUM_BASE_URL } from "src/configuration";
import { IGetSingleRate } from "src/core/dtos/rates/rates.dto";
import { IErrorReporter } from "src/core/types/error";
import { UtilsServices } from "../utils/utils.service";
import { ISwapV2 } from "src/core/dtos/trade/swap.dto";

const CURRENCY_IDS: string = "bitcoin,ethereum,ripple,stellar,celo";
const COIN_GECKO_BASE_URL: string = "https://api.coingecko.com/api/v3";
const ORDER: string = "market_cap_desc";
const PERPAGE: number = 100;
const PAGE = 1;
const SPARK_LINE: boolean = false;
// e.g 1h, 24h, 7d, 30d
const price_change_percentage = "24h";
const config = {
  headers: {
    "Content-Type": "application/json",
  },
};

@Injectable()
export class RatesServices {
  constructor(
    private http: IHttpServices,
    private readonly utilsService: UtilsServices,

  ) { }
  private TATUM_CONFIG = {
    headers: {
      "X-API-Key": TATUM_API_KEY,
    },
  };
  async findAll(base: string): Promise<ResponsesType<any>> {
    try {
      const url = `${COIN_GECKO_BASE_URL}/simple/price?ids=${CURRENCY_IDS}&vs_currencies=${base}`;

      const rates = await this.http.get(url, config);
      return Promise.resolve({
        message: "Rates retrieved successfully",
        status: HttpStatus.OK,
        data: rates,
        state: ResponseState.SUCCESS
      });
    } catch (error) {
      Logger.error(error)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async getSingleRate(payload: IGetSingleRate): Promise<ResponsesType<any>> {

    try {
      const { base, sub } = payload
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${sub}&vs_currencies=${base}`;
      const rate = await this.http.get(url, config);
      return Promise.resolve({
        message: `${sub} rate retrieved successfully`,
        status: HttpStatus.OK,
        data: rate,
        state: ResponseState.SUCCESS

      });
    } catch (error) {
      Logger.error(error)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }
  async allCryptoMarketCharts(base: string): Promise<ResponsesType<any>> {
    try {
      const url = `${COIN_GECKO_BASE_URL}/coins/markets?vs_currency=${base}&ids=${CURRENCY_IDS}&order=${ORDER}&per_page=${PERPAGE}&page=${PAGE}&SPARK_LINE=${SPARK_LINE}&price_change_percentage=${price_change_percentage}`;
      const data = await this.http.get(url, config);
      return Promise.resolve({
        message: `data retrieved successfully`,
        status: HttpStatus.OK,
        data,
        state: ResponseState.SUCCESS

      });
    } catch (error) {
      Logger.error(error)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async cryptoMarketCharts(
    base: string,
    coin: string,
    priceChangePercentage: string
  ): Promise<ResponsesType<any>> {
    const url = `${COIN_GECKO_BASE_URL}/coins/markets?vs_currency=${base}&ids=${coin}&order=${ORDER}&per_page=${PERPAGE}&page=${PAGE}&SPARK_LINE=${SPARK_LINE}&price_change_percentage=${priceChangePercentage}`;
    try {
      const data = await this.http.get(url, config);
      return Promise.resolve({
        message: `data retrieved successfully`,
        status: HttpStatus.OK,
        data,
        state: ResponseState.SUCCESS
      });
    } catch (error) {
      Logger.error(error)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async cryptoPrices(payload: { base: string, coin: string, days: string, interval: string }): Promise<ResponsesType<any>> {
    const url = `${COIN_GECKO_BASE_URL}/coins/${payload.coin}/market_chart?vs_currency=${payload.base}&days=${payload.days}&interval=${payload.interval}`;
    try {
      const data = await this.http.get(url, config);
      return Promise.resolve({ message: `data retrieved successfully`, status: HttpStatus.OK, data, state: ResponseState.SUCCESS });
    } catch (error) {
      Logger.error(error)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async exchangeRate(coin: string, base: string) {
    try {
      const url = `${TATUM_BASE_URL}/tatum/rate/${coin}?basePair=${base}`;
      const rate = await this.http.get(url, this.TATUM_CONFIG)
      return { message: "Exchange rate recieved successfully", rate, status: HttpStatus.OK }
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'TATUM EXCHANGE RATE',
        error,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async convert(payload: ISwapV2): Promise<ResponsesType<any>> {
    try {
      const { source, destination, amount } = payload
      const sourceUrl = `${TATUM_BASE_URL}/tatum/rate/${source}?basePair=USD`;
      const destinationUrl = `${TATUM_BASE_URL}/tatum/rate/${destination}?basePair=USD`;

      const { value: sourceRate } = await this.http.get(sourceUrl, this.TATUM_CONFIG)
      const { value: destinationRate } = await this.http.get(destinationUrl, this.TATUM_CONFIG)
      const { destinationAmount, rate } = await this.utilsService.swapV2({ sourceRate, destinationRate, amount })
      return {
        message: "Exchange rate recieved successfully",
        data: {
          sourceRate,
          destinationRate,
          amount,
          destinationAmount,
          rate
        },
        status: HttpStatus.OK,
        state: ResponseState.SUCCESS
      }
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'TATUM EXCHANGE RATE',
        error,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }
}
