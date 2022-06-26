import { Injectable, Logger } from "@nestjs/common";
import { Request } from "express"
import { IDataServices, INotificationServices } from "src/core/abstracts";
import { AlreadyExistsException, BadRequestsException, DoesNotExistsException } from "../user/exceptions";
import { InjectConnection } from "@nestjs/mongoose";
import databaseHelper from "src/frameworks/data-services/mongo/database-helper";
import * as mongoose from "mongoose";
import { TransactionFactoryService } from "../transaction/transaction-factory.services";
import { CUSTOM_TRANSACTION_TYPE, Transaction, TRANSACTION_STATUS, TRANSACTION_SUBTYPE, TRANSACTION_TYPE } from "src/core/entities/transaction.entity";
import { OptionalQuery } from "src/core/types/database";
import { NotificationFactoryService } from "../notification/notification-factory.service";
import { env } from "src/configuration";
import { EXTERNAL_DEPOSIT_CHANNEL_LINK } from "src/lib/constants";

Injectable()
export class WebhookServices {
  constructor(
    private data: IDataServices,
    private txFactoryServices: TransactionFactoryService,
    private notificationFactory: NotificationFactoryService,
    private discord: INotificationServices,
    @InjectConnection() private readonly connection: mongoose.Connection

  ) { }

  async tatum(req: Request) {
    try {
      const body = req.body
      Logger.log("---- webhook data- ---")
      Logger.log(body)
      Logger.log("---- webhook data- ---")

      return { message: "Webhook received successfully", status: 200, body }
    } catch (error) {
      Logger.error(error)
      if (error.name === 'TypeError') return Promise.resolve({ message: error.message, status: 200 })
      return Promise.resolve({ message: error, status: 200 })
    }
  }


  async incomingTransactions(payload: Record<string, any>) {
    try {
      const { amount, currency, reference, txId, from, to, blockHash, accountId } = payload
      const [wallet, referenceAlreadyExists, transactionIdAlreadyExists, transactionHashAlreadyExists] = await Promise.all([
        this.data.wallets.findOne({ currency, address: to, accountId }),
        this.data.transactions.findOne({ reference }),
        this.data.transactions.findOne({ tatumTransactionId: txId }),
        this.data.transactions.findOne({ hash: blockHash })
      ])

      if (!wallet) throw new DoesNotExistsException("wallet does not exist");
      if (referenceAlreadyExists) throw new AlreadyExistsException("reference already exists")
      if (transactionIdAlreadyExists) throw new AlreadyExistsException("tatumTransactionId already exists")
      if (transactionHashAlreadyExists) throw new AlreadyExistsException("Transaction hash already exists")


      const user = await this.data.users.findOne({ userId: wallet.userId })

      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {
          const creditedWallet = await this.data.wallets.update(
            {
              _id: wallet._id,
            },
            {
              $inc: {
                balance: amount,
              },
              lastDeposit: amount
            },
            session
          );
          if (!creditedWallet) {
            Logger.error("Error Occurred");
            throw new BadRequestsException("Error Occurred");
          }

          const txCreditPayload: OptionalQuery<Transaction> = {
            userId: user._id,
            walletId: wallet?._id,
            currency,
            amount,
            signedAmount: amount,
            type: TRANSACTION_TYPE.CREDIT,
            description: `Recieved ${amount} ${currency} from ${from} `,
            status: TRANSACTION_STATUS.COMPLETED,
            balanceAfter: creditedWallet?.balance,
            balanceBefore: wallet?.balance,
            subType: TRANSACTION_SUBTYPE.CREDIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.DEPOSIT,
            senderAddress: from,
            hash: blockHash,
            reference,
            tatumTransactionId: txId
          };

          const notificationPayload = {
            userId: wallet.userId,
            title: "Deposit",
            message: `Recieved ${amount} ${currency} from ${from} `,
          }

          const [notificationFactory, txCreditFactory] = await Promise.all([
            this.notificationFactory.create(notificationPayload),
            this.txFactoryServices.create(txCreditPayload)
          ])
          await Promise.all([
            this.data.transactions.create(txCreditFactory, session),
            this.data.notifications.create(notificationFactory, session)
          ])

        } catch (error) {
          Logger.error(error);
          throw new Error(error);
        }
      };

      await Promise.all([
        databaseHelper.executeTransaction(
          atomicTransaction,
          this.connection
        ),
        this.discord.inHouseNotification({
          title: `External Deposit :- ${env.env} environment`,
          message: `
  
          External Deposit
          Recieved ${amount} ${currency} from ${from}
  
          BODY : ${JSON.stringify(payload)}
  `,
          link: EXTERNAL_DEPOSIT_CHANNEL_LINK,
        })
      ])

      return { message: "Webhook received successfully", status: 200, data: payload }
    } catch (error) {
      Logger.error(error)
      if (error.name === 'TypeError') return Promise.resolve({ message: error.message, status: 200 })
      return Promise.resolve({ message: error, status: 200 })
    }
  }


  async incomingPendingTransactions(payload: Record<string, any>) {
    try {
      const { } = payload
      return { message: "Webhook received successfully", status: 200, data: payload }
    } catch (error) {
      Logger.error(error)
      if (error.name === 'TypeError') return Promise.resolve({ message: error.message, status: 200 })
      return Promise.resolve({ message: error, status: 200 })
    }
  }
}

