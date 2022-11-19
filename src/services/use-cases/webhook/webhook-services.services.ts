import { Injectable, Logger } from "@nestjs/common";
import { Request } from "express"
import { IDataServices, INotificationServices } from "src/core/abstracts";
import { BadRequestsException } from "../user/exceptions";
import { InjectConnection } from "@nestjs/mongoose";
import databaseHelper from "src/frameworks/data-services/mongo/database-helper";
import * as mongoose from "mongoose";
import { TransactionFactoryService } from "../transaction/transaction-factory.services";
import { CUSTOM_TRANSACTION_TYPE, TRANSACTION_STATUS, TRANSACTION_SUBTYPE, TRANSACTION_TYPE } from "src/core/entities/transaction.entity";
import { NotificationFactoryService } from "../notification/notification-factory.service";
import { env } from "src/configuration";
import { EXTERNAL_DEPOSIT_CHANNEL_LINK, EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION } from "src/lib/constants";
import { Wallet } from "src/core/entities/wallet.entity";
import { IErrorReporter } from "src/core/types/error";
import { UtilsServices } from "../utils/utils.service";

Injectable()
export class WebhookServices {
  constructor(
    private data: IDataServices,
    private txFactoryServices: TransactionFactoryService,
    private notificationFactory: NotificationFactoryService,
    private discord: INotificationServices,
    private readonly utilsService: UtilsServices,
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

  /**
   * 
   * @param payload 
   * @desc
   *  Enable HTTP POST JSON notifications on incoming blockchain transactions on virtual accounts. 
   * This web hook will be invoked, when the transaction is credited to the virtual account. 
   * Transaction is credited, when it has sufficient amount of blockchain confirmations. For BTC, LTC, BCH, DOGE - 2 confirmations, others - 1 confirmation. 
   * Request body of the POST request will be JSON object with attributes:
   * @returns 
   */
  async incomingTransactions(payload: Record<string, any>) {
    try {
      const { amount, currency, reference, txId, from, to, blockHash, accountId } = payload
      const [wallet, referenceAlreadyExists, transactionIdAlreadyExists, transactionHashAlreadyExists] = await Promise.all([
        this.data.wallets.findOne({ coin: currency.toUpperCase(), address: to, accountId }),
        this.data.transactions.findOne({ reference }),
        this.data.transactions.findOne({ tatumTransactionId: txId }),
        this.data.transactions.findOne({ hash: blockHash })
      ])
      if (!wallet) return Promise.resolve({ message: 'Wallet does not exists' })
      if (referenceAlreadyExists) return Promise.resolve({ message: 'reference already exists' })
      if (transactionIdAlreadyExists) return Promise.resolve({ message: 'tatumTransactionId already exists' })
      if (transactionHashAlreadyExists) return Promise.resolve({ message: 'Transaction hash already exists' })

      const user = await this.data.users.findOne({ _id: wallet.userId })
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

          const txCreditPayload = {
            userId: String(user._id),
            walletId: String(wallet?._id),
            currency,
            amount,
            signedAmount: amount,
            type: TRANSACTION_TYPE.CREDIT,
            description: `Recieved ${amount} ${currency} from ${from}`,
            status: TRANSACTION_STATUS.COMPLETED,
            balanceAfter: creditedWallet?.balance,
            balanceBefore: wallet?.balance,
            subType: TRANSACTION_SUBTYPE.CREDIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.DEPOSIT,
            senderAddress: from,
            hash: blockHash,
            reference,
            tatumTransactionId: txId,
            metadata: payload
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
          await this.data.transactions.create(txCreditFactory, session)
          await this.data.notifications.create(notificationFactory, session)


        } catch (error) {
          Logger.error(error);
          throw new Error(error);
        }
      };

      await databaseHelper.executeTransactionWithStartTransaction(
        atomicTransaction,
        this.connection
      )

      await this.discord.inHouseNotification({
        title: `External Deposit :- ${env.env} environment`,
        message: `

        External Deposit

        Recieved ${amount} ${currency} 
        
        FROM:-  ${from}
        
        TO :- ${to}

        BODY : ${JSON.stringify(payload)}
`,
        link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
      })
      return { message: "Webhook received successfully", status: 200, data: payload }
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'INCOMING DEPOSIT',
        error,
        email: payload.to,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      if (error.name === 'TypeError') return Promise.resolve({ message: error.message, status: 200 })
      return Promise.resolve({ message: error, status: 200 })
    }
  }


  /**
   * 
   * @param payload 
   * @desc
   *  Enable HTTP POST JSON notifications on incoming blockchain transactions on virtual accounts. 
   * This web hook will be invoked, when the transaction is credited to the virtual account. 
   * Transaction is credited, when it has sufficient amount of blockchain confirmations. For BTC, LTC, BCH, DOGE - 2 confirmations, others - 1 confirmation. 
   * Request body of the POST request will be JSON object with attributes:
   * @returns 
   */
   async incomingVirtualAccountTransactions(payload: Record<string, any>) {
    try {
      const { amount, currency, reference, txId, from, to, blockHash, accountId } = payload
      const [account, referenceAlreadyExists, transactionIdAlreadyExists, transactionHashAlreadyExists] = await Promise.all([
        this.data.virtualAccounts.findOne({ coin: currency.toUpperCase(), accountId }),
        this.data.transactions.findOne({ reference }),
        this.data.transactions.findOne({ tatumTransactionId: txId }),
        this.data.transactions.findOne({ hash: blockHash })
      ])
      if (!account) return Promise.resolve({ message: 'Wallet does not exists' })
      if (referenceAlreadyExists) return Promise.resolve({ message: 'reference already exists' })
      if (transactionIdAlreadyExists) return Promise.resolve({ message: 'tatumTransactionId already exists' })
      if (transactionHashAlreadyExists) return Promise.resolve({ message: 'Transaction hash already exists' })

      const user = await this.data.users.findOne({ _id: account.userId })
      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {
          const creditedAccount = await this.data.virtualAccounts.update(
            {
              _id: account._id,
            },
            {
              $inc: {
                balance: amount,
              },
              lastDeposit: amount
            },
            session
          );
          if (!creditedAccount) {
            Logger.error("Error Occurred");
            throw new BadRequestsException("Error Occurred");
          }

          const txCreditPayload = {
            userId: String(user._id),
            accountId: String(creditedAccount?._id),
            currency,
            amount,
            signedAmount: amount,
            type: TRANSACTION_TYPE.CREDIT,
            description: `Recieved ${amount} ${currency} from ${from}`,
            status: TRANSACTION_STATUS.COMPLETED,
            balanceAfter: creditedAccount?.balance,
            balanceBefore: account?.balance,
            subType: TRANSACTION_SUBTYPE.CREDIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.DEPOSIT,
            senderAddress: from,
            hash: blockHash,
            reference,
            tatumTransactionId: txId,
            metadata: payload
          };

          const notificationPayload = {
            userId: account.userId,
            title: "Deposit",
            message: `Recieved ${amount} ${currency} from ${from} `,
          }

          const [notificationFactory, txCreditFactory] = await Promise.all([
            this.notificationFactory.create(notificationPayload),
            this.txFactoryServices.create(txCreditPayload)
          ])
          await this.data.transactions.create(txCreditFactory, session)
          await this.data.notifications.create(notificationFactory, session)


        } catch (error) {
          Logger.error(error);
          throw new Error(error);
        }
      };

      await databaseHelper.executeTransactionWithStartTransaction(
        atomicTransaction,
        this.connection
      )

      await this.discord.inHouseNotification({
        title: `External Deposit :- ${env.env} environment`,
        message: `

        External Deposit

        Recieved ${amount} ${currency} 
        
        FROM:-  ${from}
        
        TO :- ${to}

        BODY : ${JSON.stringify(payload)}
`,
        link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
      })
      return { message: "Webhook received successfully", status: 200, data: payload }
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'INCOMING DEPOSIT',
        error,
        email: payload.to,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      if (error.name === 'TypeError') return Promise.resolve({ message: error.message, status: 200 })
      return Promise.resolve({ message: error, status: 200 })
    }
  }


  
  async incomingPendingTransactions(payload: Record<string, any>) {
    try {

      const { amount, currency, accountId, from, to } = payload
      const wallet: Wallet = await this.data.wallets.findOne({ accountId, coin: currency.toUpperCase(), address: to })

      if (!wallet) return Promise.resolve({ message: 'Wallet does not exists' })
      const factory = await this.notificationFactory.create({
        title: "Incoming Deposit",
        message: `Incoming deposit of ${amount}${currency} from ${from}`,
        userId: wallet.userId
      })

      await this.data.notifications.create(factory)
      return { message: "Webhook received successfully", status: 200, data: payload }

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'INCOMING PENDING DEPOSIT',
        error,
        email: payload.to,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      if (error.name === 'TypeError') return Promise.resolve({ message: error.message, status: 200 })
      return Promise.resolve({ message: error, status: 200 })
    }
  }

  async incomingVirtualAccountPendingTransactions(payload: Record<string, any>) {
    try {

      const { amount, currency, accountId, from } = payload
      const account = await this.data.wallets.findOne({ accountId })

      if (!account) return Promise.resolve({ message: 'Account does not exists' })
      const factory = await this.notificationFactory.create({
        title: "Incoming Deposit",
        message: `Incoming deposit of ${amount} ${currency} from ${from}`,
        userId: account.userId
      })

      await this.data.notifications.create(factory)
      return { message: "Webhook received successfully", status: 200, data: payload }

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'INCOMING PENDING DEPOSIT',
        error,
        email: payload.to,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      if (error.name === 'TypeError') return Promise.resolve({ message: error.message, status: 200 })
      return Promise.resolve({ message: error, status: 200 })
    }
  }


}

