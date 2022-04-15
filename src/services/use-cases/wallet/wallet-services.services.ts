import { BadRequestsException } from "./../user/exceptions";
import { Wallet } from "./../../../core/entities/wallet.entity";
import { IHttpServices } from "src/core/abstracts/http-services.abstract";
import { FundDto } from "./../../../core/dtos/wallet/fund.dto";
import { DoesNotExistsException } from "src/services/use-cases/user/exceptions";
import { IDataServices } from "src/core/abstracts";
import { BLOCKCHAIN_CHAIN, COIN_TYPES } from "src/lib/constants";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import {
  MONO_SECRET_KEY,
  TATUM_API_KEY,
  TATUM_BASE_URL,
  TATUM_BTC_ACCOUNT_ID,
  TATUM_USDC_ACCOUNT_ID,
  TATUM_USDT_ACCOUNT_ID,
  TATUM_USDT_TRON_ACCOUNT_ID,
} from "src/configuration";
import { WalletFactoryService } from "./wallet-factory.service";
import { UserDetail } from "src/core/entities/user.entity";

@Injectable()
export class WalletServices {
  constructor(
    private emitter: EventEmitter2,
    private http: IHttpServices,
    private dataServices: IDataServices,
    private walletFactory: WalletFactoryService
  ) {}

  async create(userId: string) {
    try {
      const user = await this.dataServices.users.findOne({ _id: userId });
      if (!user) throw new DoesNotExistsException("User does not exist");

      const userDetail: UserDetail = {
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
      };

      const wallets = [
        {
          userId,
          coin: COIN_TYPES.BTC,
          accountId: TATUM_BTC_ACCOUNT_ID,
          chain: BLOCKCHAIN_CHAIN.BTC,
          userDetail,
        },
        {
          userId,
          coin: COIN_TYPES.USDT,
          accountId: TATUM_USDT_ACCOUNT_ID,
          chain: BLOCKCHAIN_CHAIN.ETH,
          userDetail,
        },
        {
          userId,
          coin: COIN_TYPES.USDC,
          accountId: TATUM_USDC_ACCOUNT_ID,
          chain: BLOCKCHAIN_CHAIN.ETH,
          userDetail,
        },
        {
          userId,
          coin: COIN_TYPES.USDT_TRON,
          accountId: TATUM_USDT_TRON_ACCOUNT_ID,
          chain: BLOCKCHAIN_CHAIN.TRON,
          userDetail,
        },
        {
          userId,
          coin: COIN_TYPES.NGN,
          accountId: "",
          chain: "",
          userDetail,
        },
      ];

      wallets.map(async ({ coin, accountId, chain, userDetail }) => {
        try {
          const wallet = await this.dataServices.wallets.findOne({
            userId,
            coin,
          });
          if (!wallet) {
            if (coin === COIN_TYPES.NGN) {
              const walletPayload: Wallet = {
                address: "",
                userId,
                user: userDetail,
                accountId: "",
                coin: COIN_TYPES.NGN,
                isBlocked: false,
                lastDeposit: 0,
                lastWithdrawal: 0,
                network: null,
              };
              const factory = await this.walletFactory.create(walletPayload);
              await this.dataServices.wallets.create(factory);
            }
            const CONFIG = {
              headers: {
                "X-API-Key": TATUM_API_KEY,
              },
            };
            const { address, destinationTag, memo, message } =
              await this.http.post(
                `${TATUM_BASE_URL}/offchain/account/${accountId}/address`,
                {},
                CONFIG
              );
            this.emitter.emit("send.webhook.subscription", { chain, address });

            const walletPayload: Wallet = {
              address,
              userId,
              user: userDetail,
              accountId,
              coin,
              isBlocked: false,
              lastDeposit: 0,
              lastWithdrawal: 0,
              network: null,
            };
            const factory = await this.walletFactory.create({
              ...walletPayload,
              destinationTag,
              memo,
              tatumMessage: message,
            });
            await this.dataServices.wallets.create(factory);
          }
          throw new BadRequestsException("Wallet already exists");
        } catch (error) {
          Logger.error(error);
          if (error.name === "TypeError")
            throw new HttpException(error.message, 500);
        }
      });

      return {
        message: "Wallets created successfully",
        data: {},
        status: HttpStatus.CREATED,
      };
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }

  async findAll(query, userId: string) {
    try {
      this.emitter.emit("create.wallet", { userId });
      const wallets = await this.dataServices.wallets.findAllWithPagination({
        query,
        queryFields: { userId: userId },
      });
      return {
        status: 200,
        message: "Wallets retrieved successfully",
        wallets,
      };
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
      if (!wallet) throw new DoesNotExistsException("wallet does not exist");
      return { status: 200, message: "Wallet retrieved successfully", wallet };
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
      Logger.log(response);
      return response;
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }
}
