import { IHttpServices } from "src/core/abstracts/http-services.abstract";
import { FundDto } from "./../../../core/dtos/wallet/fund.dto";
import { DoesNotExistsException } from "src/services/use-cases/user/exceptions";
import { IDataServices } from "src/core/abstracts";

import { BLOCKCHAIN_NETWORK, NETWORK } from "src/lib/constants";
import { COIN_TYPES } from "src/lib/constants";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import { env, MONO_SECRET_KEY } from "src/configuration";

@Injectable()
export class WalletServices {
  constructor(
    private emitter: EventEmitter2,
    private http: IHttpServices,
    private dataServices: IDataServices
  ) {}

  async create(userId: string) {
    const ETH_NETWORK = env.isProd ? NETWORK.MAINNET : NETWORK.ROPSTEN;
    const coins = [
      {
        userId: userId,
        blockchain: BLOCKCHAIN_NETWORK.BITCOIN,
        network: env.isProd ? NETWORK.MAINNET : NETWORK.TESTNET,
        coin: COIN_TYPES.BTC,
      },
      {
        userId: userId,
        blockchain: BLOCKCHAIN_NETWORK.ETHEREUM,
        network: ETH_NETWORK,
        coin: COIN_TYPES.USDT,
      },
      {
        userId: userId,
        blockchain: BLOCKCHAIN_NETWORK.ETHEREUM,
        network: ETH_NETWORK,
        coin: COIN_TYPES.USDC,
      },
      {
        userId: userId,
        blockchain: null,
        network: null,
        coin: COIN_TYPES.NGN,
      },
    ];
    coins.map((coin) => this.emitter.emit("create.wallet", coin));
  }

  async findAll(userId: string) {
    try {
      const wallet = await this.dataServices.wallets.find({ userId: userId });
      if (wallet.length === 0 || !wallet) throw new DoesNotExistsException("Wallet Does not exist");
      return wallet;
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }

  async details(id: string) {
    try {
      const details = await this.dataServices.wallets.findOne({ _id: id });
      if(!details)throw new DoesNotExistsException('wallet does not exist')
      return details;
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
      const wallet = await this.dataServices.wallets.findOne({
        userId: userId,
        coin: COIN_TYPES.NGN,
      });
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
