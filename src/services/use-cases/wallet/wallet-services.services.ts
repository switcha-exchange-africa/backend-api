import { IHttpServices } from "src/core/abstracts/http-services.abstract";
import { FundDto } from "./../../../core/dtos/wallet/fund.dto";
import { DoesNotExistsException } from "src/services/use-cases/user/exceptions";
import { IDataServices } from "src/core/abstracts";
import { BLOCKCHAIN_CHAIN, COIN_TYPES } from "src/lib/constants";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import {
  MONO_SECRET_KEY,
  TATUM_BTC_ACCOUNT_ID,
} from "src/configuration";

@Injectable()
export class WalletServices {
  constructor(
    private emitter: EventEmitter2,
    private http: IHttpServices,
    private dataServices: IDataServices,
  ) { }

  // deprecated, don't use
  async create(userId: string) {
    const coins = [
      {
        userId,
        coin: COIN_TYPES.BTC,
        accountId: TATUM_BTC_ACCOUNT_ID,
        chain: BLOCKCHAIN_CHAIN.BTC
      },
      // {
      //   userId,
      //   coin: COIN_TYPES.USDT,
      //   accountId: TATUM_USDT_ACCOUNT_ID,
      //   chain:BLOCKCHAIN_CHAIN.ETH
      // },
      // {
      //   userId,
      //   coin: COIN_TYPES.USDC,
      //   accountId: TATUM_USDC_ACCOUNT_ID,
      //   chain:BLOCKCHAIN_CHAIN.ETH

      // },
      // {
      //   userId,
      //   coin: COIN_TYPES.USDT_TRON,
      //   accountId: TATUM_USDT_TRON_ACCOUNT_ID,
      //   chain:BLOCKCHAIN_CHAIN.TRON

      // },
      {
        userId,
        coin: COIN_TYPES.NGN,
        accountId: ""
      },
    ];
    coins.map((coin) => this.emitter.emit("create.wallet", coin));
  }

  async findAll(query, userId: string) {
    try {
      this.emitter.emit("create.wallet", { userId })
      const wallets = await this.dataServices.wallets.findAllWithPagination({ query, queryFields: { userId: userId } });
      return { status: 200, message: 'Wallets retrieved successfully', wallets }
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }

  async details(id: string) {
    try {

      const wallet = await this.dataServices.wallets.findOne({ _id: id });
      if (!wallet) throw new DoesNotExistsException('wallet does not exist')
      return { status: 200, message: 'Wallet retrieved successfully', wallet }
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }

  async fund(body: FundDto, userId) {
    try {
      const { amount } = body;
      const user = await this.dataServices.users.findOne({ _id: userId });
      if (!user) throw new DoesNotExistsException("user does not exist");
      const wallet = await this.dataServices.wallets.findOne({ userId: userId, coin: COIN_TYPES.NGN });
      if (!wallet) throw new DoesNotExistsException("wallet does not exist");
      const url = "https://api.withmono.com/v1/payments/initiate";
      const data = {
        amount,
        type: "onetime-debit",
        description: "Wallet Deposit",
        reference: `ref${String(wallet._id)}`,
        meta: {
          reference: `${String(wallet._id)}`,
        },
      };
      const config = {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "mono-sec-key": MONO_SECRET_KEY,
        },
      };
      const response = this.http.post(url, data, config);
      Logger.log(response)
      return response;
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }
}
