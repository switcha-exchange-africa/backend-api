import { IHttpServices } from "src/core/abstracts/http-services.abstract";
import { IDataServices, INotificationServices } from "src/core/abstracts";
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import {
  env,
  TATUM_API_KEY,
  TATUM_BASE_URL,
  TATUM_BTC_ACCOUNT_ID,
  TATUM_ETH_ACCOUNT_ID,
  TATUM_USDC_ACCOUNT_ID,
  TATUM_USDT_ACCOUNT_ID,
  TATUM_USDT_TRON_ACCOUNT_ID,
} from "src/configuration";
import { WalletFactoryService } from "./wallet-factory.service";
import { BLOCKCHAIN_CHAIN, Wallet } from "src/core/entities/wallet.entity";
import { Types } from "mongoose";
import { ResponseState, ResponsesType } from "src/core/types/response";
import { IGetWallets } from "src/core/dtos/wallet/wallet.dto";
import { CoinType } from "src/core/types/coin";
import { IErrorReporter } from "src/core/types/error";
import { UtilsServices } from "../utils/utils.service";
import { WALLET_CHANNEL_LINK_DEVELOPMENT, WALLET_CHANNEL_LINK_PRODUCTION } from "src/lib/constants";
import { EventEmitter2 } from "@nestjs/event-emitter";


const generateTatumWalletPayload = (coin: CoinType) => {
  let payload: any

  switch (coin) {
    case CoinType.BTC:
      payload = {
        coin: CoinType.BTC,
        accountId: TATUM_BTC_ACCOUNT_ID,
        chain: BLOCKCHAIN_CHAIN.BTC,
      }
      break;

    case CoinType.ETH:
      payload = {
        coin: CoinType.ETH,
        accountId: TATUM_ETH_ACCOUNT_ID,
        chain: BLOCKCHAIN_CHAIN.ETH,
      }
      break;
    case CoinType.USDT:
      payload = {
        coin: CoinType.USDT,
        accountId: TATUM_USDT_ACCOUNT_ID,
        chain: BLOCKCHAIN_CHAIN.ETH,
      }
      break;

    case CoinType.USDC:
      payload = {
        coin: CoinType.USDC,
        accountId: TATUM_USDC_ACCOUNT_ID,
        chain: BLOCKCHAIN_CHAIN.ETH,
      }
      break;

    case CoinType.USDT_TRON:
      payload =
      {
        coin: CoinType.USDT_TRON,
        accountId: TATUM_USDT_TRON_ACCOUNT_ID,
        chain: BLOCKCHAIN_CHAIN.TRON,
      }
      break;


  }
  return payload;
};
@Injectable()
export class WalletServices {
  constructor(
    private http: IHttpServices,
    private data: IDataServices,
    private walletFactory: WalletFactoryService,
    private readonly discordServices: INotificationServices,
    private readonly utilsService: UtilsServices,
    private readonly emitter: EventEmitter2,

  ) { }

  cleanQueryPayload(payload: IGetWallets) {
    let key = {}
    if (payload.userId) key['userId'] = payload.userId
    if (payload.coin) key['coin'] = payload.coin
    if (payload.perpage) key['perpage'] = payload.perpage
    if (payload.page) key['page'] = payload.page
    if (payload.dateFrom) key['dateFrom'] = payload.dateFrom
    if (payload.dateTo) key['dateTo'] = payload.dateTo
    if (payload.sortBy) key['sortBy'] = payload.sortBy
    if (payload.orderBy) key['orderBy'] = payload.orderBy
    if (payload.reference) key['reference'] = payload.reference
    return key
  }
  async create(payload: {
    userId: string,
    coin: CoinType,
    fullName: string,
    email: string
  }): Promise<ResponsesType<Wallet>> {
    try {
      const { userId, coin, fullName, email } = payload

      const [walletExists, userExists] = await Promise.all([
        this.data.wallets.findOne({ userId, coin }),
        this.data.users.findOne({ _id: userId }),

      ]);
      if (walletExists) return Promise.reject({
        status: HttpStatus.CONFLICT,
        state: ResponseState.ERROR,
        message: 'Wallet already exists',
        error: null,
      })
      if (!userExists) {
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: 'User does not exists',
          error: null,
        })
      }

      if (coin === CoinType.NGN) {
        const walletPayload = {
          address: "",
          userId,
          accountId: "",
          coin: CoinType.NGN,
          isBlocked: false,
          network: null,
        };
        const factory = await this.walletFactory.create(walletPayload);
        const data = await this.data.wallets.create(factory);
        await this.discordServices.inHouseNotification({
          title: `Wallet Channel :- ${env.env} environment`,
          message: `NGN wallet generated for ${fullName}:- ${email}`,
          link: env.isProd ? WALLET_CHANNEL_LINK_PRODUCTION : WALLET_CHANNEL_LINK_DEVELOPMENT,
        })


        return {
          message: "Wallet created successfully",
          data,
          status: HttpStatus.CREATED,
          state: ResponseState.SUCCESS
        };
      }

      if (coin === CoinType.USD) {
        const walletPayload = {
          address: "",
          userId,
          accountId: "",
          coin: CoinType.USD,
          isBlocked: false,
          network: null,
        };
        const factory = await this.walletFactory.create(walletPayload);
        const data = await this.data.wallets.create(factory);
        await this.discordServices.inHouseNotification({
          title: `Wallet Channel :- ${env.env} environment`,
          message: `USD wallet generated for ${fullName}:- ${email}`,
          link: env.isProd ? WALLET_CHANNEL_LINK_PRODUCTION : WALLET_CHANNEL_LINK_DEVELOPMENT,
        })

        return {
          message: "Wallet created successfully",
          data,
          status: HttpStatus.CREATED,
          state: ResponseState.SUCCESS

        };
      }

      const tatumPayload = generateTatumWalletPayload(coin)
      const CONFIG = {
        headers: {
          "X-API-Key": TATUM_API_KEY,
        },
      };

      const { address, destinationTag, memo, message } = await this.http.post(
        `${TATUM_BASE_URL}/offchain/account/${tatumPayload.accountId}/address`,
        {},
        CONFIG
      );

      const walletPayload = {
        address,
        userId,
        accountId: tatumPayload.accountId,
        coin,
        isBlocked: false,
        network: null,
      };
      const factory = await this.walletFactory.create({
        ...walletPayload,
        destinationTag,
        memo,
        tatumMessage: message,
      });

      const data = await this.data.wallets.create(factory);
      await this.discordServices.inHouseNotification({
        title: `Wallet Channel :- ${env.env} environment`,
        message: `
        ${coin} wallet generated for ${fullName}:- ${email}
        
        ADDRESS:-${address}
        `,
        link: env.isProd ? WALLET_CHANNEL_LINK_PRODUCTION : WALLET_CHANNEL_LINK_DEVELOPMENT,
      })
      return {
        message: "Wallet created successfully",
        data, status: HttpStatus.CREATED,
        state: ResponseState.SUCCESS

      };

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'GENERATING WALLET',
        error,
        email: payload.email,
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
  // async createMultipleWallet(userId: string) {
  //   try {
  //     const user = await this.dataServices.users.findOne({ _id: userId });
  //     if (!user) throw new DoesNotExistsException("User does not exist");

  //     const userDetail: UserDetail = {
  //       email: user.email,
  //       fullName: `${user.firstName} ${user.lastName}`,
  //     };

  //     const wallets = [
  //       {
  //         userId,
  //         coin: CoinType.BTC,
  //         accountId: TATUM_BTC_ACCOUNT_ID,
  //         chain: BLOCKCHAIN_CHAIN.BTC,
  //         userDetail,
  //       },
  //       {
  //         userId,
  //         coin: CoinType.USDT,
  //         accountId: TATUM_USDT_ACCOUNT_ID,
  //         chain: BLOCKCHAIN_CHAIN.ETH,
  //         userDetail,
  //       },
  //       {
  //         userId,
  //         coin: CoinType.USDC,
  //         accountId: TATUM_USDC_ACCOUNT_ID,
  //         chain: BLOCKCHAIN_CHAIN.ETH,
  //         userDetail,
  //       },
  //       {
  //         userId,
  //         coin: CoinType.USDT_TRON,
  //         accountId: TATUM_USDT_TRON_ACCOUNT_ID,
  //         chain: BLOCKCHAIN_CHAIN.TRON,
  //         userDetail,
  //       },
  //       {
  //         userId,
  //         coin: CoinType.NGN,
  //         accountId: "",
  //         chain: "",
  //         userDetail,
  //       },
  //     ];

  //     wallets.map(async ({ coin, accountId, chain }) => {
  //       try {
  //         const wallet = await this.dataServices.wallets.findOne({
  //           userId,
  //           coin,
  //         });
  //         if (!wallet) {
  //           if (coin === CoinType.NGN) {
  //             const walletPayload = {
  //               address: "",
  //               userId,
  //               accountId: "",
  //               coin: CoinType.NGN,
  //               isBlocked: false,
  //               lastDeposit: 0,
  //               lastWithdrawal: 0,
  //               network: null,
  //             };
  //             const factory = await this.walletFactory.create(walletPayload);
  //             await this.dataServices.wallets.create(factory);
  //           }
  //           const CONFIG = {
  //             headers: {
  //               "X-API-Key": TATUM_API_KEY,
  //             },
  //           };
  //           const { address, destinationTag, memo, message } =
  //             await this.http.post(
  //               `${TATUM_BASE_URL}/offchain/account/${accountId}/address`,
  //               {},
  //               CONFIG
  //             );
  //           this.emitter.emit("send.webhook.subscription", { chain, address });

  //           const walletPayload = {
  //             address,
  //             userId,
  //             accountId,
  //             coin,
  //             isBlocked: false,
  //             lastDeposit: 0,
  //             lastWithdrawal: 0,
  //             network: null,
  //           };
  //           const factory = await this.walletFactory.create({
  //             ...walletPayload,
  //             destinationTag,
  //             memo,
  //             tatumMessage: message,
  //           });
  //           await this.dataServices.wallets.create(factory);
  //         }
  //         throw new BadRequestsException("Wallet already exists");
  //       } catch (error) {
  //         Logger.error(error);
  //         if (error.name === "TypeError")
  //           throw new HttpException(error.message, 500);
  //       }
  //     });

  //     return {
  //       message: "Wallets created successfully",
  //       data: {},
  //       status: HttpStatus.CREATED,
  //     };
  //   } catch (error) {
  //     Logger.error(error);
  //     if (error.name === "TypeError")
  //       throw new HttpException(error.message, 500);
  //     throw new Error(error);
  //   }
  // }

  async findAll(payload: IGetWallets): Promise<ResponsesType<Wallet>> {
    try {
      const { isAdmin, q, perpage, page, dateFrom, dateTo, sortBy, orderBy, } = payload
      if (q) {
        const { data, pagination } = await this.data.wallets.search({
          query: {
            q,
            perpage,
            page,
            dateFrom,
            dateTo,
            sortBy,
            orderBy,
          }
        })
        return {
          status: HttpStatus.OK,
          message: "Wallet retrieved successfully",
          data,
          state: ResponseState.SUCCESS,
          pagination,
        };
      }

      const cleanedPayload = this.cleanQueryPayload(payload)
      if (!isAdmin) {
        await this.emitter.emit("create.wallet", {
          userId: payload.userId,
          email: payload.email,
          fullName: payload.fullName
        })
      }

      const { data, pagination } = await this.data.wallets.findAllWithPagination({
        query: cleanedPayload,
        queryFields: {},
        misc: {
          populated: {
            path: 'userId',
            select: '_id firstName lastName email phone'
          }
        }
      });

      return {
        status: HttpStatus.OK,
        message: "Wallets retrieved successfully",
        data,
        pagination,
        state: ResponseState.SUCCESS
      };
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

  async details(id: Types.ObjectId): Promise<ResponsesType<Wallet>> {
    try {
      const data = await this.data.wallets.findOne({ _id: id });
      if (!data) return Promise.reject({
        status: HttpStatus.NOT_FOUND,
        state: ResponseState.ERROR,
        message: 'Wallet does not exist',
        error: null,
      })
      return { status: HttpStatus.OK, message: "Wallet retrieved successfully", data, state: ResponseState.SUCCESS };
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

  // async fund(body: FundDto, userId) {
  //   try {
  //     const { amount } = body;
  //     const user = await this.dataServices.users.findOne({ _id: userId });
  //     if (!user) throw new DoesNotExistsException("user does not exist");
  //     const wallet = await this.dataServices.wallets.findOne({
  //       userId: userId,
  //       coin: CoinType.NGN,
  //     });
  //     if (!wallet) throw new DoesNotExistsException("wallet does not exist");
  //     const url = "https://api.withmono.com/v1/payments/initiate";
  //     const data = {
  //       amount,
  //       type: "onetime-debit",
  //       description: "Wallet Deposit",
  //       reference: `ref${String(wallet._id)}`,
  //       meta: {
  //         reference: `${String(wallet._id)}`,
  //       },
  //     };
  //     const config = {
  //       headers: {
  //         "Content-Type": "application/json",
  //         Accept: "application/json",
  //         "mono-sec-key": MONO_SECRET_KEY,
  //       },
  //     };
  //     const response = this.http.post(url, data, config);
  //     Logger.log(response);
  //     return response;
  //   } catch (error) {
  //     Logger.error(error);
  //     if (error.name === "TypeError")
  //       throw new HttpException(error.message, 500);
  //     throw new Error(error);
  //   }
  // }
}
