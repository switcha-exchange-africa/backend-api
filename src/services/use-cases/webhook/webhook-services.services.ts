import { Injectable, Logger } from "@nestjs/common";
import { Request } from "express"
import { IDataServices, INotificationServices } from "src/core/abstracts";
import { BadRequestsException } from "../user/exceptions";
import { InjectConnection } from "@nestjs/mongoose";
import databaseHelper from "src/frameworks/data-services/mongo/database-helper";
import * as mongoose from "mongoose";
import { TransactionFactoryService } from "../transaction/transaction-factory.services";
import { CUSTOM_TRANSACTION_TYPE, Transaction, TRANSACTION_SUBTYPE, TRANSACTION_TYPE } from "src/core/entities/transaction.entity";
import { NotificationFactoryService } from "../notification/notification-factory.service";
import { env } from "src/configuration";
import { EXTERNAL_DEPOSIT_CHANNEL_LINK, EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION } from "src/lib/constants";
import { Wallet } from "src/core/entities/wallet.entity";
import { IErrorReporter } from "src/core/types/error";
import { UtilsServices } from "../utils/utils.service";
import { Status } from "src/core/types/status";
import { WithdrawalStatus } from "src/core/entities/Withdrawal";
import { OptionalQuery } from "src/core/types/database";
import { generateReference } from "src/lib/utils";

Injectable()
export class WebhookServices {
  constructor(
    private data: IDataServices,
    private txFactoryServices: TransactionFactoryService,
    private notificationFactory: NotificationFactoryService,
    private discord: INotificationServices,
    private readonly utilsService: UtilsServices,
    @InjectConnection('switcha') private readonly connection: mongoose.Connection

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
      if (!wallet) {
        await this.discord.inHouseNotification({
          title: `Incoming Deposit V.1 :- ${env.env} environment`,
          message: `
          Wallet does not exists

          BODY : ${JSON.stringify(payload)}
  `,
          link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
        })

        return Promise.resolve({ message: 'Wallet does not exists' })
      }
      if (referenceAlreadyExists) {
        await this.discord.inHouseNotification({
          title: `Incoming Deposit V.1 :- ${env.env} environment`,
          message: `
          reference already exists

          BODY : ${JSON.stringify(payload)}
  `,
          link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
        })

        return Promise.resolve({ message: 'reference already exists' })
      }
      if (transactionIdAlreadyExists) {
        await this.discord.inHouseNotification({
          title: `Incoming Deposit V.1 :- ${env.env} environment`,
          message: `
          tatumTransactionId already exists

          BODY : ${JSON.stringify(payload)}
  `,
          link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
        })

        return Promise.resolve({ message: 'tatumTransactionId already exists' })
      }
      if (transactionHashAlreadyExists) {
        await this.discord.inHouseNotification({
          title: `Incoming Deposit V.1 :- ${env.env} environment`,
          message: `
          Transaction hash already exists

          BODY : ${JSON.stringify(payload)}
  `,
          link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
        })
        return Promise.resolve({ message: 'Transaction hash already exists' })
      }

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
            status: Status.COMPLETED,
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
        this.data.transactions.findOne({ hash: blockHash }),
        ,

      ])
      if (!account) {
        await this.discord.inHouseNotification({
          title: `Incoming Deposit :- ${env.env} environment`,
          message: `
            Account does not exists
  
          BODY : ${JSON.stringify(payload)}
  `,
          link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
        })
        return Promise.resolve({ message: 'Wallet does not exists' })
      }
      if (referenceAlreadyExists) {
        await this.discord.inHouseNotification({
          title: `Incoming Deposit :- ${env.env} environment`,
          message: `
          reference already exists

          BODY : ${JSON.stringify(payload)}
  `,
          link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
        })
        return Promise.resolve({ message: 'reference already exists' })
      }
      if (transactionIdAlreadyExists) {
        await this.discord.inHouseNotification({
          title: `Incoming Deposit :- ${env.env} environment`,
          message: `
          tatumTransactionId already exists            
          
          BODY : ${JSON.stringify(payload)}
  `,
          link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
        })
        return Promise.resolve({ message: 'tatumTransactionId already exists' })
      }
      if (transactionHashAlreadyExists) {
        await this.discord.inHouseNotification({
          title: `Incoming Deposit :- ${env.env} environment`,
          message: `
          Transaction hash already exists
          
          BODY : ${JSON.stringify(payload)}
  `,
          link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
        })
        return Promise.resolve({ message: 'Transaction hash already exists' })
      }

      const user = await this.data.users.findOne({ _id: account.userId })
      const depositAddress = await this.data.depositAddresses.findOne({ address: to, coin: currency.toUpperCase(), userId: account.userId })
      if (!depositAddress) return Promise.resolve({ message: `Deposit address ${to} doesnt exists in our system` })

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
            status: Status.COMPLETED,
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
          await this.data.depositAddresses.update(
            { address: to, coin: currency.toUpperCase(), userId: account.userId },
            { status: Status.COMPLETED }
          )

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

        ACCOUNT ID :- ${accountId}


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


      await this.discord.inHouseNotification({
        title: `Pending External Deposit :- ${env.env} environment`,
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

      const { amount, currency, accountId, from, to } = payload
      const account = await this.data.virtualAccounts.findOne({ accountId })

      if (!account) return Promise.resolve({ message: 'Account does not exists' })
      const factory = await this.notificationFactory.create({
        title: "Incoming Deposit",
        message: `Incoming deposit of ${amount} ${currency} from ${from}`,
        userId: account.userId
      })
      const user = await this.data.users.findOne({ _id: account.userId })

      await this.data.notifications.create(factory)
      await this.data.depositAddresses.update(
        { address: to, coin: currency.toUpperCase(), userId: account.userId },
        { status: Status.PROCESSING }
      )

      await this.discord.inHouseNotification({
        title: `Pending External Deposit :- ${env.env} environment`,
        message: `

        External Deposit

        Recieved ${amount} ${currency} 
        
        FROM:-  ${from}
        
        TO :- ${to}

        EMAIL:- ${user.email}

        ACCOUNT ID :- ${accountId}

        BODY : ${JSON.stringify(payload)}
`,
        link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
      })
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

  async txBlock(payload: Record<string, any>) {
    try {
      const { txId, reference, accountId, currency, withdrawalId, address, amount } = payload
      const [transactionAlreadyExists, transaction, virtualAccount, withdrawal] = await Promise.all([
        this.data.transactions.findOne({ reference }),
        this.data.transactions.findOne({ tatumTransactionId: txId, status: Status.PENDING, withdrawalId }),
        this.data.virtualAccounts.findOne({ accountId, coin: currency.toUpperCase() }),
        this.data.withdrawals.findOne({ blockchainTransactionId: txId })
      ])
      if (withdrawal.status === WithdrawalStatus.APPROVED) {
        await this.discord.inHouseNotification({
          title: `Withdrawal :- ${env.env} environment`,
          message: `
          Withdrawal already completed

          BODY : ${JSON.stringify(payload)}
  `,
          link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
        })

        return Promise.resolve({ message: 'Transaction already exists' })
      }
      if (withdrawal.status === WithdrawalStatus.PENDING) {
        const atomicTransaction = async (session: mongoose.ClientSession) => {
          await this.data.transactions.update(
            { _id: withdrawal.transactionId },
            {
              status: Status.COMPLETED,
            },
            session
          )

          await this.data.transactions.update(
            { _id: withdrawal.feeTransactionId },
            {
              status: Status.COMPLETED,
            },
            session
          )
          await this.data.transactions.update(
            { _id: withdrawal.feeWalletTransactionId },
            {
              status: Status.COMPLETED,
            },
            session
          )
          await this.data.withdrawals.update(
            { _id: withdrawal._id },
            {
              status: Status.APPROVED,
            },
            session
          )
        }
        await databaseHelper.executeTransactionWithStartTransaction(
          atomicTransaction,
          this.connection
        )
        await this.discord.inHouseNotification({
          title: `Withdrawal :- ${env.env} environment`,
          message: `
          
          ACTION: CUSTODIAL WALLET

          External Withdrawal Web
  
          Withdraw ${amount} ${currency} 
          
          
          TO :- ${address}
  
          TX ID/HASH: ${txId}
  
          BODY : ${JSON.stringify(payload)}
  `,
          link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
        })
        // state last withdrawal
        // update transaction status and reference
        // store reference
        return { message: "Webhook received successfully", status: 200, data: payload }

      }




      if (transactionAlreadyExists) {
        await this.discord.inHouseNotification({
          title: `Withdrawal :- ${env.env} environment`,
          message: `
          Transaction already exists

          BODY : ${JSON.stringify(payload)}
  `,
          link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
        })

        return Promise.resolve({ message: 'Transaction already exists' })
      }
      if (!transaction) {
        await this.discord.inHouseNotification({
          title: `Withdrawal :- ${env.env} environment`,
          message: `
          Transaction does not exists or already completed

          BODY : ${JSON.stringify(payload)}
  `,
          link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
        })
        return Promise.resolve({ message: 'Transaction does not exists or already completed' })
      }
      if (!virtualAccount) {
        await this.discord.inHouseNotification({
          title: `Withdrawal :- ${env.env} environment`,
          message: `
          Wallet does not exists

          BODY : ${JSON.stringify(payload)}
  `,
          link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
        })
        return Promise.resolve({ message: 'Wallet does not exists' })

      }


      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {
          // deduct from virtualAccountBalance

          const deductedAccount = await this.data.virtualAccounts.update(
            {
              _id: virtualAccount._id,
            },
            {
              $inc: {
                balance: -amount,
              },
              lastWithdrawal: amount
            },
            session
          );
          if (!deductedAccount) {
            Logger.error("Error Occurred");
            await this.discord.inHouseNotification({
              title: `Withdrawal :- ${env.env} environment`,
              message: `
      Deduction Failed
      
              BODY : ${JSON.stringify(payload)}
      `,
              link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
            })
            throw new Error("Error Occurred");
          }
          await this.data.transactions.update(
            { _id: transaction._id },
            {
              status: Status.COMPLETED,
              description: 'Withdrawal successful',
              reference,
              balanceAfter: deductedAccount.balance,
              metadata: JSON.stringify(payload)
            },
            session
          )


          const notificationFactory = await this.notificationFactory.create({
            title: "Withdrawal Completed",
            message: `Withdrawal  of ${amount} ${currency} to ${address} was successful`,
            userId: virtualAccount.userId
          })

          await this.data.notifications.create(notificationFactory, session)
        } catch (error) {
          Logger.error(error);
          throw new Error(error);
        }
      }
      await databaseHelper.executeTransactionWithStartTransaction(
        atomicTransaction,
        this.connection
      )

      await this.discord.inHouseNotification({
        title: `Withdrawal :- ${env.env} environment`,
        message: `

        External Withdrawal

        Withdraw ${amount} ${currency} 
        
        
        TO :- ${address}

        TX ID/HASH: ${txId}

        BODY : ${JSON.stringify(payload)}
`,
        link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
      })
      // state last withdrawal
      // update transaction status and reference
      // store reference
      return { message: "Webhook received successfully", status: 200, data: payload }

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'TATUM TX BLOCK',
        error,
        email: payload.to,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      if (error.name === 'TypeError') return Promise.resolve({ message: error.message, status: 200 })
      return Promise.resolve({ message: error, status: 200 })
    }
  }

  async addressTransaction(payload: Record<string, any>) {
    try {
      const { address, amount: amountBeforeConversion, counterAddress, txId, mempool } = payload
      const feeWallet = await this.data.feeWallets.findOne({ address })

      const convertedAmount = Number(amountBeforeConversion)
      const debitDescription = ''
      const creditDescription = `Recieved ${convertedAmount} ${feeWallet.coin}`
      const description = Math.sign(convertedAmount) === 1 ? creditDescription : debitDescription
      const type = Math.sign(convertedAmount) === 1 ? TRANSACTION_TYPE.CREDIT : TRANSACTION_TYPE.DEBIT
      const customTransactionType = Math.sign(convertedAmount) === 1 ? CUSTOM_TRANSACTION_TYPE.DEPOSIT : CUSTOM_TRANSACTION_TYPE.WITHDRAWAL
      const subType = Math.sign(convertedAmount) === 1 ? TRANSACTION_SUBTYPE.CREDIT : TRANSACTION_SUBTYPE.DEBIT


      if (mempool) {
        await this.discord.inHouseNotification({
          title: `Address Transaction :- ${env.env} environment`,
          message: `
          Transaction still in Mempool
          BODY : ${JSON.stringify(payload)}
  `,
          link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
        })
        // state last withdrawal
        // update transaction status and reference
        // store reference
        return { message: "Webhook received successfully", status: 200, data: payload }

      }

      const atomicTransaction = async (session: mongoose.ClientSession) => {
        const processWallet = Math.sign(convertedAmount) === 1 ? await this.data.feeWallets.update(
          {
            _id: feeWallet._id,
          },
          {
            $inc: {
              balance: convertedAmount,
            },
            lastDeposit: convertedAmount
          },
          session
        ) : await this.data.feeWallets.update(
          {
            _id: feeWallet._id
          },
          {
            $inc: {
              balance: -convertedAmount
            },
            lastWithdrawal: convertedAmount

          }, session
        )

        const txCreditPayload: OptionalQuery<Transaction> = {
          feeWalletId: String(feeWallet._id),
          currency: feeWallet.coin,
          amount: convertedAmount,
          signedAmount: Math.sign(convertedAmount) === 1 ? convertedAmount : -convertedAmount,
          type,
          description: description,
          status: Status.COMPLETED,
          balanceAfter: processWallet?.balance,
          balanceBefore: feeWallet?.balance,
          subType: subType,
          customTransactionType: customTransactionType,
          senderAddress: counterAddress,
          reference: generateReference('credit'),
          tatumTransactionId: txId,
          metadata: payload
        };

        const factory = await this.txFactoryServices.create(txCreditPayload)
        await this.data.transactions.create(factory, session)
      }
      await databaseHelper.executeTransactionWithStartTransaction(
        atomicTransaction,
        this.connection
      )

      await this.discord.inHouseNotification({
        title: `External Deposit To Fee Wallet:- ${env.env} environment`,
        message: `

        External Deposit

        Recieved ${description} 
        

        BODY : ${JSON.stringify(payload)}
`,
        link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
      })
      return { message: "Webhook received successfully", status: 200, data: payload }
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'TATUM ADDRESS  NOTIFICATION',
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

    // "txId": "0x026f4f05b972c09279111da13dfd20d8df04eff436d7f604cd97b9ffaa690567",
    // "reference": "90270634-5b07-4fad-b17b-f82899953533",
    // "accountId": "6086ed0744c45b24d4fbd039",
    // "currency": "BSC",
    // "withdrawalId": "608fe5b73a893234ba379ab2",
    // "address": "0x8ce4e40889a13971681391AAd29E88eFAF91f784",
    // "amount": "0.1",
    // "blockHeight": 8517664