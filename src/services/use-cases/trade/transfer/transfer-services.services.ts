import { TransactionFactoryService } from "src/services/use-cases/transaction/transaction-factory.services";
import {
  BadRequestsException,
  DoesNotExistsException,
} from "src/services/use-cases/user/exceptions";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import { IDataServices } from "src/core/abstracts";
import { TransferDto } from "src/core/dtos/trade/transfer.dto";
import * as mongoose from "mongoose";
import { TransactionReference } from "src/core/entities/transaction-reference.entity";
import { CUSTOM_TRANSACTION_TYPE, Transaction, TRANSACTION_STATUS, TRANSACTION_SUBTYPE, TRANSACTION_TYPE } from "src/core/entities/transaction.entity";

import databaseHelper from "src/frameworks/data-services/mongo/database-helper";
import { InjectConnection } from "@nestjs/mongoose";

@Injectable()
export class TransferServices {
  constructor(
    private data: IDataServices,
    private txFactoryServices: TransactionFactoryService,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) {}

  async transfer(body: TransferDto, userId: string) {
    const { recipientEmail, coin, recipientAddress, amount } = body;

    try {
      const [recipient, sender] = await Promise.all([
        this.data.users.findOne({ recipientEmail }),
        this.data.users.findOne({ _id: userId }),
      ]);
      if (!recipient)
        throw new DoesNotExistsException("Recipient does not exist");
      if (!sender) throw new DoesNotExistsException("Sender does not exist");

      const [creditWallet, debitWallet] = await Promise.all([
        this.data.wallets.findOne({
          userId: String(recipient._id),
          coin,
          address: recipientAddress,
        }),
        this.data.wallets.findOne({
          userId,
          coin,
          balance: { $gt: amount },
        }),
      ]);

      if (!creditWallet) throw new DoesNotExistsException("Recipient Wallet does not exist");
      if (!debitWallet) throw new DoesNotExistsException("Sender Wallet does not exist");

      
      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {
          const debitedWallet = await this.data.wallets.update(
            { _id: debitWallet._id },
            {
              $set: { lastWithdrawal: amount, updatedAt: new Date() },
              $inc: { balance: -amount },
            },

            session
          );
          if (!debitedWallet) {
            Logger.error("Error Occurred");
            throw new BadRequestsException("Error Occurred");
          }

          const creditedWallet = await this.data.wallets.update(
            { _id: creditWallet._id },
            {
              $set: { lastDeposit: amount, updatedAt: new Date() },
              $inc: { balance: amount },
            },
            session
          );
          if (!creditedWallet) {
            Logger.error("Error Occurred");
            throw new BadRequestsException("Error Occurred");
          }

          const txRefPayload: TransactionReference = { userId, amount };
          const txRef = await this.data.transactionReferences.create(
            txRefPayload,
            session
          );

          const txCreditPayload: Transaction = {
            userId: recipient._id,
            walletId: creditWallet?._id,
            txRefId: txRef?._id,
            currency: creditedWallet.coin,
            amount,
            signedAmount: amount,
            type: TRANSACTION_TYPE.CREDIT,
            description: "transfer currency",
            status: TRANSACTION_STATUS.COMPLETED,
            balanceAfter: creditedWallet?.balance,
            balanceBefore: creditWallet?.balance,
            hash: txRef?.hash,
            subType: TRANSACTION_SUBTYPE.CREDIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.TRANSFER,
          };

          const txDebitPayload: Transaction = {
            userId: sender._id,
            walletId: debitWallet?._id,
            txRefId: txRef?._id,
            currency: debitedWallet.coin,
            amount,
            signedAmount: amount,
            type: TRANSACTION_TYPE.DEBIT,
            description: "transfer currency",
            status: TRANSACTION_STATUS.COMPLETED,
            balanceAfter: debitedWallet?.balance,
            balanceBefore: debitWallet?.balance,
            hash: txRef?.hash,
            subType: TRANSACTION_SUBTYPE.DEBIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.TRANSFER,
          };

          const [txCreditFactory, txDebitFactory] = await Promise.all([
            this.txFactoryServices.create(txCreditPayload),
            this.txFactoryServices.create(txDebitPayload),
          ]);

          await Promise.all([
            this.data.transactions.create(txCreditFactory, session),
            this.data.transactions.create(txDebitFactory, session),
          ]);
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
        message: `transfer successful`,
        data: {},
        status: 200,
      };
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw error;
    }
  }
}
