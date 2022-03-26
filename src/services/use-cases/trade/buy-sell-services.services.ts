import { TransactionReference } from "src/core/entities/transaction-reference.entity";
import { InjectConnection } from "@nestjs/mongoose";
import databaseHelper from "src/frameworks/data-services/mongo/database-helper";
import { BuySellDto } from "src/core/dtos/trade/buy-sell.dto";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import { IHttpServices } from "src/core/abstracts/http-services.abstract";
import { IDataServices } from "src/core/abstracts";
import {
  BadRequestsException,
  DoesNotExistsException,
} from "../user/exceptions";
import { CRYPTO_API_KEY, TATUM_BASE_URL } from "src/configuration";
import {
  COIN_TYPES,
  CUSTOM_TRANSACTION_TYPE,
  TRANSACTION_STATUS,
  TRANSACTION_SUBTYPE,
  TRANSACTION_TYPE,
} from "src/lib/constants";
import * as mongoose from "mongoose";
import { Transaction } from "src/core/entities/transaction.entity";
import { TransactionFactoryService } from "../transaction/transaction-factory.services";
import { ResponsesType } from "src/core/types/response";

@Injectable()
export class BuySellServices {
  private config = {
    headers: {
      "X-API-Key": CRYPTO_API_KEY,
    },
  };
  constructor(
    private http: IHttpServices,
    private dataServices: IDataServices,
    private txFactoryServices: TransactionFactoryService,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) {}

  async buy(body: BuySellDto, userId: string) : Promise<ResponsesType<any>>{
    const { amount, currency } = body;
    try {
      const url = `${TATUM_BASE_URL}/rate/${currency}?basePair=${COIN_TYPES.NGN}`;

      const [user, cryptoWallet, ngnWallet, { value }] = await Promise.all([
        this.dataServices.users.findOne({ _id: userId }),
        this.dataServices.wallets.findOne({
          userId,
          coin: currency,
        }),
        this.dataServices.wallets.findOne({
          userId,
          coin: COIN_TYPES.NGN,
          balance: { $gt: 0 },
        }),
        this.http.get(url, this.config),
      ]);
      if (!user) throw new DoesNotExistsException("user does not exist");
      if (!cryptoWallet || !ngnWallet)
        throw new DoesNotExistsException("wallet does not exist");

      const currencyAmount = parseFloat((value * amount).toFixed(4));

      let txFactory: any;
      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {
          const updatedNgnWallet = await this.dataServices.wallets.update(
            {
              _id: ngnWallet._id,
              balance: { $gte: currencyAmount },
            },
            {
              $inc: {
                balance: -currencyAmount,
              },
            },
            session
          );

          if (!updatedNgnWallet) {
            Logger.error("Balance is 0");
            throw new BadRequestsException("Balance is 0");
          }

          const updatedCryptoWallet = await this.dataServices.wallets.update(
            {
              _id: cryptoWallet,
            },
            {
              $inc: {
                balance: amount,
              },
            },
            session
          );
          if (!updatedCryptoWallet) {
            Logger.error("Error Occurred");
            throw new BadRequestsException("Error Occurred");
          }
          const txRefPayload: TransactionReference = { userId, amount };
          const txRef = await this.dataServices.transactionReferences.create(
            txRefPayload,
            session
          );
          const txPayload: Transaction = {
            userId,
            walletId: updatedCryptoWallet?._id,
            txRefId: txRef?._id,
            currency,
            amount,
            signedAmount: amount,
            type: TRANSACTION_TYPE.CREDIT,
            description: `${currency} bought`,
            status: TRANSACTION_STATUS.COMPLETED,
            balanceAfter: updatedCryptoWallet?.balance,
            balanceBefore: cryptoWallet?.balance,
            hash: txRef?.hash,
            subType: TRANSACTION_SUBTYPE.CREDIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.BUY,
          };

          txFactory = await this.txFactoryServices.create(txPayload);
          await this.dataServices.transactions.create(txFactory, session);
        } catch (error) {
          Logger.error(error);
          throw new Error(error);
        }
      };
      await databaseHelper.executeTransaction(
        atomicTransaction,
        this.connection
      );
      return {
        message: `${currency} bought successfully`,
        data: { ...txFactory, value },
        status: 200,
      };
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }

  async sell(body: BuySellDto, userId: string) : Promise<ResponsesType<any>>{
    const { amount, currency } = body;
    try {
      const [user, cryptoWallet, ngnWallet] = await Promise.all([
        this.dataServices.users.findOne({ _id: userId }),
        this.dataServices.wallets.findOne({
          userId,
          coin: currency,
        }),
        this.dataServices.wallets.findOne({
          userId,
          coin: COIN_TYPES.NGN,
        }),
      ]);
      if (!user) throw new DoesNotExistsException("user does not exist");
      if (!cryptoWallet || !ngnWallet)
        throw new DoesNotExistsException("wallet does not exist");

      const url = `${TATUM_BASE_URL}/rate/${cryptoWallet.coin}?basePair=${COIN_TYPES.NGN}`;
      const { value } = await this.http.get(url, this.config);
      const currencyAmount = parseFloat((value * amount).toFixed(4));

      let txFactory: any;
      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {
          const updatedNgnWallet = await this.dataServices.wallets.update(
            {
              _id: ngnWallet._id,
            },
            {
              $inc: {
                balance: currencyAmount,
              },
            },
            session
          );

          if (!updatedNgnWallet) {
            Logger.error("Error Occurred");
            throw new BadRequestsException("Error Occurred");
          }

          const updatedCryptoWallet = await this.dataServices.wallets.update(
            {
              _id: cryptoWallet,
              balance: { $gt: 0, $gte: amount },
            },
            {
              $inc: {
                balance: -amount,
              },
            },
            session
          );
          if (!updatedCryptoWallet) {
            Logger.error("Error Occurred");
            throw new BadRequestsException("Error Occurred");
          }
          const txRefPayload: TransactionReference = { userId, amount };
          const txRef = await this.dataServices.transactionReferences.create(
            txRefPayload,
            session
          );
          const txPayload: Transaction = {
            userId,
            walletId: updatedCryptoWallet?._id,
            txRefId: txRef?._id,
            currency,
            amount,
            signedAmount: amount,
            type: TRANSACTION_TYPE.DEBIT,
            description: `${currency} sold`,
            status: TRANSACTION_STATUS.COMPLETED,
            balanceAfter: updatedCryptoWallet?.balance,
            balanceBefore: cryptoWallet?.balance,
            hash: txRef?.hash,
            subType: TRANSACTION_SUBTYPE.DEBIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.SELL,
          };

          txFactory = await this.txFactoryServices.create(txPayload);
          await this.dataServices.transactions.create(txFactory, session);
        } catch (error) {
          Logger.error(error);
          throw new Error(error);
        }
      };
      await databaseHelper.executeTransaction(
        atomicTransaction,
        this.connection
      );
      return {
        message: `${currency} sold successfully`,
        data: { ...txFactory, value },
        status: 200,
      };
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }
}
