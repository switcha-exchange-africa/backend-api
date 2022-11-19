import { TransactionFactoryService } from "src/services/use-cases/transaction/transaction-factory.services";
import {
  BadRequestsException,
  DoesNotExistsException,
} from "src/services/use-cases/user/exceptions";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import { IDataServices } from "src/core/abstracts";
import { TransferDto } from "src/core/dtos/trade/transfer.dto";
import * as mongoose from "mongoose";
import { CUSTOM_TRANSACTION_TYPE, Transaction, TRANSACTION_SUBTYPE, TRANSACTION_TYPE } from "src/core/entities/transaction.entity";
import databaseHelper from "src/frameworks/data-services/mongo/database-helper";
import { InjectConnection } from "@nestjs/mongoose";
import { generateReference } from "src/lib/utils";
import { OptionalQuery } from "src/core/types/database";
import { Status } from "src/core/types/status";

@Injectable()
export class TransferServices {
  constructor(
    private data: IDataServices,
    private txFactoryServices: TransactionFactoryService,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) { }

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

          const generalTransactionReference = generateReference('general')

          const txCreditPayload: OptionalQuery<Transaction> = {
            userId: String(recipient._id),
            walletId: String(creditWallet?._id),
            currency: creditedWallet.coin,
            amount,
            signedAmount: amount,
            type: TRANSACTION_TYPE.CREDIT,
            description: "transfer currency",
            status: Status.COMPLETED,
            balanceAfter: creditedWallet?.balance,
            balanceBefore: creditWallet?.balance,
            subType: TRANSACTION_SUBTYPE.CREDIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.TRANSFER,
            generalTransactionReference,
            reference: generateReference('credit'),

          };

          const txDebitPayload: OptionalQuery<Transaction> = {
            userId: String(sender._id),
            walletId: String(debitWallet?._id),
            currency: debitedWallet.coin,
            amount,
            signedAmount: amount,
            type: TRANSACTION_TYPE.DEBIT,
            description: "transfer currency",
            status: Status.COMPLETED,
            balanceAfter: debitedWallet?.balance,
            balanceBefore: debitWallet?.balance,
            subType: TRANSACTION_SUBTYPE.DEBIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.TRANSFER,
            generalTransactionReference,
            reference: generateReference('debit'),

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
      await databaseHelper.executeTransactionWithStartTransaction(
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
