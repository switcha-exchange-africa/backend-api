import { IHttpServices } from "src/core/abstracts/http-services.abstract";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import { ForbiddenRequestException } from "../user/exceptions";

@Injectable()
export class RatesServices {
  constructor(private http: IHttpServices) {}

  async findAll() {
    try {
      const url =
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum%2Cstellar%2Cripple%2Ccelo&vs_currencies=ngn";
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
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
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      const rate = await this.http.get(url, config);
      return Promise.resolve({
        message: `${asset} rate retrieved successfully`,
        status: 200,
        rate,
      });
    } catch (error) {}
  }
}
