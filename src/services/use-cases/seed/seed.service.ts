import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { IDataServices } from "src/core/abstracts";
import { FeeWallet } from "src/core/entities/FeeWallet";
import { Coin, CoinType as CoinEnum } from "src/core/entities/Coin";
import { ResponseState, ResponsesType } from "src/core/types/response";
import { generateReference } from "src/lib/utils";
import * as mongoose from "mongoose";
import { IFeeAmountType } from "src/core/dtos/fee";
import { InjectConnection } from "@nestjs/mongoose";
import databaseHelper from "src/frameworks/data-services/mongo/database-helper";
import { CoinType } from "src/core/types/coin";
import { env } from "src/configuration";
import { FeatureEnum } from "src/core/dtos/activity";

@Injectable()
export class SeedServices {
  constructor(
    private data: IDataServices,
    @InjectConnection('switcha') private readonly connection: mongoose.Connection

  ) { }

  async seed(userId: string): Promise<ResponsesType<FeeWallet[]>> {
    try {
      if (env.isProd) {
        return {
          status: HttpStatus.OK,
          message: "Data seeded successfully",
          data: {},
          state: ResponseState.SUCCESS
        };
      }

      const feeWalletSeed = [
        {
          userId,
          coin: CoinType.BTC,
          reference: generateReference('general')
        },
        {
          userId,
          coin: CoinType.USD,
          reference: generateReference('general')
        },
        {
          userId,
          coin: CoinType.USDC,
          reference: generateReference('general')

        },
        {
          userId,
          coin: CoinType.USDT,
          reference: generateReference('general')

        },
        {
          userId,
          coin: CoinType.USDT_TRON,
          reference: generateReference('general')

        },
        {
          userId,
          coin: CoinType.ETH,
          reference: generateReference('general')

        },
        {
          userId,
          coin: CoinType.NGN,
          reference: generateReference('general')

        },
      ]

      const coinSeed: Coin[] = [
        {
          userId,
          coin: 'BTC',
          type: CoinEnum.CRYPTO,
          canSwap: true,
          canBuy: true,
          canSell: true,
          canP2p: true,
          canWithdraw: true,
          externalDeposit: true,
          bankTransferDeposit: false

        },
        {
          userId,
          coin: 'ETH',
          type: CoinEnum.CRYPTO,
          canSwap: true,
          canBuy: true,
          canSell: true,
          canP2p: true,
          canWithdraw: true,
          externalDeposit: true,
          bankTransferDeposit: false


        },
        {
          userId,
          coin: 'USDT',
          type: CoinEnum.CRYPTO,
          canSwap: true,
          canBuy: true,
          canSell: true,
          canP2p: true,
          canWithdraw: true,
          externalDeposit: true,
          bankTransferDeposit: false


        },
        {
          userId,
          coin: 'USDT_TRON',
          type: CoinEnum.CRYPTO,
          canSwap: true,
          canBuy: true,
          canSell: true,
          canP2p: true,
          canWithdraw: true,
          externalDeposit: true,
          bankTransferDeposit: false


        },
        {
          userId,
          coin: 'USDC',
          canSwap: true,
          type: CoinEnum.CRYPTO,
          canBuy: true,
          canSell: true,
          canP2p: true,
          canWithdraw: true,
          externalDeposit: true,
          bankTransferDeposit: false

        },
        {
          userId,
          coin: 'NGN',
          canSwap: false,
          type: CoinEnum.FIAT,
          canBuy: false,
          canSell: false,
          canP2p: false,
          canWithdraw: false,
          externalDeposit: false,
          bankTransferDeposit: true

        },
      ]
      const feeSeed = [
        {
          feature: "swap",
          amountInPercentage: 0.5,
          amountInFixed: 0,
          amountType: IFeeAmountType.PERCENTAGE,
          userId
        },
        {
          feature: "buy",
          amountInPercentage: 0.5,
          amountInFixed: 0,
          amountType: IFeeAmountType.PERCENTAGE,
          userId
        },
        {
          feature: "sell",
          amountInPercentage: 0.5,
          amountInFixed: 0,
          amountType: IFeeAmountType.PERCENTAGE,
          userId
        },
        {
          feature: "p2p-sell",
          amountInPercentage: 0.5,
          amountInFixed: 0,
          amountType: IFeeAmountType.PERCENTAGE,
          userId
        },
        {
          feature: "p2p-buy",
          amountInPercentage: 0.5,
          amountInFixed: 0,
          amountType: IFeeAmountType.PERCENTAGE,
          userId
        },

        {
          feature: "fiat-withdrawal",
          amountInPercentage: 0.5,
          amountInFixed: 0,
          amountType: IFeeAmountType.PERCENTAGE,
          userId
        },
        {
          feature: "fiat-deposit",
          amountInPercentage: 0.5,
          amountInFixed: 0,
          amountType: IFeeAmountType.PERCENTAGE,
          userId
        },
        {
          feature: "crypto-withdrawal",
          amountInPercentage: 0.5,
          amountInFixed: 0,
          amountType: IFeeAmountType.PERCENTAGE,
          userId
        }
      ]
      const withdrawalFeeSeed = [
        {
          coin: "USDT",
          fee: 20,
          userId
        },
        {
          coin: "USDC",
          fee: 20,
          userId
        },
        {
          coin: "USDT_TRON",
          fee: 1,
          userId
        },
        {
          coin: "BTC",
          fee: 0.0003,
          userId
        },
        {
          coin: "ETH",
          fee: 0.004,
          userId
        },
      ]
      const featureManagementSeed = [
        {
          userId,
          feature: FeatureEnum.SIGNUP,
          active: true
        },
        {
          userId,
          feature: FeatureEnum.SIGNIN,
          active: true
        },
        {
          userId,
          feature: FeatureEnum.VERIFY_EMAIL,
          active: true
        },
        {
          userId,
          feature: FeatureEnum.RECOVER_PASSWORD,
          active: true
        },
        {
          userId,
          feature: FeatureEnum.RESET_PASSWORD,
          active: true
        },
        {
          userId,
          feature: FeatureEnum.WITHDRAWAL,
          active: true
        },
        {
          userId,
          feature: FeatureEnum.DEPOSIT,
          active: true
        },
        {
          userId,
          feature: FeatureEnum.SWAP,
          active: true
        },
        {
          userId,
          feature: FeatureEnum.P2P_AD,
          active: true
        },
        {
          userId,
          feature: FeatureEnum.P2P_ORDER,
          active: true
        },
        {
          userId,
          feature: FeatureEnum.QUICK_TRADE,
          active: true
        },
      ]



      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {
          await this.data.feeWallets.create(feeWalletSeed, session)
          await this.data.coins.create(coinSeed, session)
          await this.data.fees.create(feeSeed, session)
          await this.data.coinWithdrawalFee.create(withdrawalFeeSeed, session)
          await this.data.featureManagement.create(featureManagementSeed, session)

        } catch (error) {
          Logger.error(error);
          throw new Error(error);
        }
      }
      await databaseHelper.executeTransactionWithStartTransaction(
        atomicTransaction,
        this.connection
      )
      return {
        status: HttpStatus.OK,
        message: "Data seeded successfully",
        data: {},
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

}