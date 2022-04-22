import { TransactionFactoryService } from "src/services/use-cases/transaction/transaction-factory.services";
import { Transaction } from "src/core/entities/transaction.entity";
import { TransactionReference } from "src/core/entities/transaction-reference.entity";
import {
  BadRequestsException,
  DoesNotExistsException,
} from "src/services/use-cases/user/exceptions";
import { Injectable, Logger } from "@nestjs/common";
import { IDataServices } from "src/core/abstracts";
import { SwapDto } from "src/core/dtos/trade/swap.dto";
import { TATUM_API_KEY, TATUM_BASE_URL } from "src/configuration";
import { IHttpServices } from "src/core/abstracts/http-services.abstract";
import {
  CoinType,
  CUSTOM_TRANSACTION_TYPE,
  TRANSACTION_STATUS,
  TRANSACTION_SUBTYPE,
  TRANSACTION_TYPE,
} from "src/lib/constants";

import * as mongoose from "mongoose";
import databaseHelper from "src/frameworks/data-services/mongo/database-helper";
import { InjectConnection } from "@nestjs/mongoose";
import { ResponsesType } from "src/core/types/response";

const TATUM_CONFIG = {
  headers: {
    "X-API-Key": TATUM_API_KEY,
  },
};
@Injectable()
export class SwapServices {
  constructor(
    private dataServices: IDataServices,
    private http: IHttpServices,
    private txFactoryServices: TransactionFactoryService,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) { }

  async swap(body: SwapDto, userId: string): Promise<ResponsesType<any>> {
    const { amount, sourceCoin, destinationCoin } = body;
    const [user, sourceWallet, destinationWallet] = await Promise.all([
      this.dataServices.users.findOne({ _id: userId }),
      this.dataServices.wallets.findOne({
        userId,
        coin: sourceCoin,
      }),
      this.dataServices.wallets.findOne({
        userId,
        coin: destinationCoin,
      }),
    ]);
    if (!user) throw new DoesNotExistsException("user does not exist");

    if (!sourceWallet) throw new DoesNotExistsException(`${sourceWallet} does not exists`);
    if (!destinationWallet) throw new DoesNotExistsException(`${destinationWallet} does not exists`);


    const sourceRateUrl = `${TATUM_BASE_URL}/rate/${sourceCoin}?basePair=${CoinType.USD}`;
    const destinationRateUrl = `${TATUM_BASE_URL}/rate/${destinationCoin}?basePair=${CoinType.USD}`;


    const [{ value: sourceRate }, { value: destinationRate }] = await Promise.all([
      this.http.get(sourceRateUrl, TATUM_CONFIG),
      this.http.get(destinationRateUrl, TATUM_CONFIG),
    ]);

    const destinationAmount = parseFloat(((sourceRate / destinationRate) * amount).toFixed(4));

    const atomicTransaction = async (session: mongoose.ClientSession) => {
      try {
        const creditDestinationWallet = await this.dataServices.wallets.update(
          {
            _id: destinationWallet._id,
          },
          {
            $inc: {
              balance: destinationAmount,
            },
          },
          session
        );

        if (!creditDestinationWallet) {
          Logger.error("Error Occurred");
          throw new BadRequestsException("Error Occurred");
        }

        const debitSourceWallet = await this.dataServices.wallets.update(
          {
            _id: sourceWallet.id,
            balance: { $gt: 0, $gte: amount },
          },
          {
            $inc: {
              balance: -amount,
            },
          },
          session
        );
        if (!debitSourceWallet) {
          Logger.error("Error Occurred");
          throw new BadRequestsException("Error Occurred");
        }
        const txRefPayload: TransactionReference = { userId, amount };
        const txRef = await this.dataServices.transactionReferences.create(txRefPayload, session);


        const txCreditPayload: Transaction = {
          userId,
          walletId: destinationWallet?._id,
          txRefId: txRef?._id,
          currency: destinationCoin,
          amount: destinationAmount,
          signedAmount: destinationAmount,
          type: TRANSACTION_TYPE.CREDIT,
          description: "swap currency",
          status: TRANSACTION_STATUS.COMPLETED,
          balanceAfter: destinationWallet?.balance,
          balanceBefore: creditDestinationWallet?.balance,
          hash: txRef?.hash,
          subType: TRANSACTION_SUBTYPE.CREDIT,
          customTransactionType: CUSTOM_TRANSACTION_TYPE.SWAP,
        };

        const txDebitPayload: Transaction = {
          userId,
          walletId: sourceWallet?._id,
          txRefId: txRef?._id,
          currency: sourceCoin,
          amount: amount,
          signedAmount: -amount,
          type: TRANSACTION_TYPE.DEBIT,
          description: "swap currency",
          status: TRANSACTION_STATUS.COMPLETED,
          balanceAfter: sourceWallet?.balance,
          balanceBefore: debitSourceWallet?.balance,
          hash: txRef?.hash,
          subType: TRANSACTION_SUBTYPE.DEBIT,
          customTransactionType: CUSTOM_TRANSACTION_TYPE.SWAP,
        };

        const [txCreditFactory, txDebitFactory] = await Promise.all([
          this.txFactoryServices.create(txCreditPayload),
          this.txFactoryServices.create(txDebitPayload)
        ])

        await Promise.all([
          this.dataServices.transactions.create(txCreditFactory, session),
          this.dataServices.transactions.create(txDebitFactory, session)
        ])

      } catch (error) {
        Logger.error(error);
        throw new Error(error);
      }
    };
    await databaseHelper.executeTransaction(atomicTransaction, this.connection);
    return {
      message: `swap successful`,
      data: {  },
      status: 200,
    };
  }
}
