import { TransactionReference } from "./../../../core/entities/transaction-reference.entity";
import { InjectConnection } from "@nestjs/mongoose";
import databaseHelper from "src/frameworks/data-services/mongo/database-helper";
import { TradeDto } from "src/core/dtos/trade/trade.dto";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import { IHttpServices } from "src/core/abstracts/http-services.abstract";
import { IDataServices } from "src/core/abstracts";
import {
  BadRequestsException,
  DoesNotExistsException,
} from "../user/exceptions";
import { CRYPTO_API_KEY } from "src/configuration";
import {
  COIN_TYPES,
  CUSTOM_TRANSACTION_TYPE,
  TRADE_TYPE,
  TRANSACTION_STATUS,
  TRANSACTION_SUBTYPE,
  TRANSACTION_TYPE,
} from "src/lib/constants";
import * as mongoose from "mongoose";
import { generateTXHash } from "src/lib/utils";
import { Transaction } from "src/core/entities/transaction.entity";
import { TransactionFactoryService } from "../transaction/transaction-factory.services";

@Injectable()
export class TradeServices {
  constructor(
    private http: IHttpServices,
    private dataServices: IDataServices,
    private txFactoryServices: TransactionFactoryService,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) {}

  async withNgn(body: TradeDto, userId: string) {
    const { type, amount, currency } = body;
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

      const url = `https://api-us-west1.tatum.io/v3/tatum/rate/${cryptoWallet.coin}?basePair=${COIN_TYPES.NGN}`;
      const config = {
        headers: {
          "X-API-Key": CRYPTO_API_KEY,
        },
      };
      const { value } = await this.http.get(url, config);
      const currencyAmount =
        type == TRADE_TYPE.buy
          ? parseFloat((value * amount).toFixed(4))
          : -parseFloat((value * amount).toFixed(4));

      let updatedNgnWallet, updatedCryptoWallet, txFactory: any;
      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {
          updatedNgnWallet = await this.dataServices.wallets.update(
            {
              _id: ngnWallet._id,
              balance: type === TRADE_TYPE.buy ? { $gt: 0 } : ngnWallet.balance,
            },
            {
              $inc: {
                balance: -currencyAmount,
              },
            },
            session
          );

          if (!updatedNgnWallet) {
            await session.abortTransaction();
            Logger.error("Balance is 0");
            throw new BadRequestsException("Balance is 0");
          }

          updatedCryptoWallet = await this.dataServices.wallets.update(
            {
              _id: cryptoWallet,
              balance:
                type === TRADE_TYPE.sell ? { $gt: 0 } : cryptoWallet.balance,
            },
            {
              $inc: {
                balance: currencyAmount,
              },
            },
            session
          );
          if (!updatedCryptoWallet) {
            Logger.error("Error Occurred");
            throw new BadRequestsException("Error Occurred");
          }
          const hash = generateTXHash();
          const txRefPayload: TransactionReference = {
            userId,
            amount: currencyAmount,
            hash,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
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
            type:
              type === TRADE_TYPE.buy
                ? TRANSACTION_TYPE.CREDIT
                : TRANSACTION_TYPE.DEBIT,
            description: "",
            status: TRANSACTION_STATUS.COMPLETED,
            balanceAfter: updatedCryptoWallet?.balance,
            balanceBefore: cryptoWallet?.balance,
            hash,
            subType:
              type === TRADE_TYPE.buy
                ? TRANSACTION_SUBTYPE.CREDIT
                : TRANSACTION_SUBTYPE.DEBIT,
            customTransactionType:
              type === TRADE_TYPE.buy
                ? CUSTOM_TRANSACTION_TYPE.BUY
                : CUSTOM_TRANSACTION_TYPE.SELL,
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
        message: txFactory ? `successful ${currency} trade` : "Transaction failed",
        txFactory,
        rateBought: txFactory && value,
        status: txFactory ? 200 : 500,
      };
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }
}
