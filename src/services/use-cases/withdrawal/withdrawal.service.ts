import { HttpStatus, Injectable, Logger } from "@nestjs/common"
import {
  env, TATUM_BASE_URL, TATUM_CONFIG,
  // TATUM_BASE_URL, TATUM_CONFIG
} from "src/configuration"
import { IDataServices, INotificationServices } from "src/core/abstracts"
import { IHttpServices } from "src/core/abstracts/http-services.abstract"
import { ICreateWithdrawal } from "src/core/dtos/withdrawal"
import { CUSTOM_TRANSACTION_TYPE, Transaction, TRANSACTION_SUBTYPE, TRANSACTION_TYPE } from "src/core/entities/transaction.entity"
import { OptionalQuery } from "src/core/types/database"
import { ResponseState } from "src/core/types/response"
import { UtilsServices } from "../utils/utils.service"
import * as mongoose from "mongoose";
import { generateReference } from "src/lib/utils"
import { TransactionFactoryService } from "../transaction/transaction-factory.services"
import {
  IGetWithdrawals,
  Withdrawal,
  WithdrawalStatus,
  WithdrawalSubType,
  WithdrawalType,
  //  WithdrawalSubType, WithdrawalType
} from "src/core/entities/Withdrawal"
import { Wallet } from "src/core/entities/wallet.entity"
// import { WithdrawalFactoryService } from "./withdrawal-factory.service"
import { NotificationFactoryService } from "../notification/notification-factory.service"
import { ActivityFactoryService } from "../activity/activity-factory.service"
import { ActivityAction } from "src/core/dtos/activity"
import databaseHelper from "src/frameworks/data-services/mongo/database-helper"
import { InjectConnection } from "@nestjs/mongoose"
import { WITHDRAWAL_CHANNEL_LINK_DEVELOPMENT, WITHDRAWAL_CHANNEL_LINK_PRODUCTION } from "src/lib/constants"
import * as _ from 'lodash'
import { IErrorReporter } from "src/core/types/error"
import { Status } from "src/core/types/status"
import { WithdrawalFactoryService } from "./withdrawal-factory.service"
// import { WithdrawalLib } from "./withdrawal.lib"

@Injectable()
export class WithdrawalServices {
  constructor(
    private readonly data: IDataServices,
    private readonly utils: UtilsServices,
    private readonly transactionFactory: TransactionFactoryService,
    private readonly withdrawalFactory: WithdrawalFactoryService,
    private readonly notificationFactory: NotificationFactoryService,
    private readonly activityFactory: ActivityFactoryService,
    private readonly discord: INotificationServices,
    private readonly http: IHttpServices,
    // private readonly lib: WithdrawalLib,
    @InjectConnection() private readonly connection: mongoose.Connection

  ) { }

  cleanQueryPayload(payload: IGetWithdrawals) {
    let key = {}
    if (payload.userId) key['userId'] = payload.userId
    if (payload.transactionId) key['transactionId'] = payload.transactionId
    if (payload.walletId) key['walletId'] = payload.walletId
    if (payload.bankId) key['bankId'] = payload.bankId
    if (payload.processedBy) key['processedBy'] = payload.processedBy
    if (payload.currency) key['currency'] = payload.currency
    if (payload.reference) key['reference'] = payload.reference
    if (payload.type) key['type'] = payload.type
    if (payload.subType) key['subType'] = payload.subType
    if (payload.paymentMethod) key['paymentMethod'] = payload.paymentMethod
    if (payload.status) key['status'] = payload.status
    if (payload.perpage) key['perpage'] = payload.perpage
    if (payload.page) key['page'] = payload.page
    if (payload.dateFrom) key['dateFrom'] = payload.dateFrom
    if (payload.dateTo) key['dateTo'] = payload.dateTo
    if (payload.sortBy) key['sortBy'] = payload.sortBy
    if (payload.orderBy) key['orderBy'] = payload.orderBy
    return key
  }
  async createCryptoWithdrawalManual(payload: ICreateWithdrawal) {
    const { coin, destination, amount: amountBeforeFee, userId, email } = payload

    try {
      // check if user has access to this feature
      const userManagement = await this.data.userFeatureManagement.findOne({ userId: new mongoose.Types.ObjectId(userId) })
      if (!userManagement) {
        return Promise.reject({
          status: HttpStatus.SERVICE_UNAVAILABLE,
          state: ResponseState.ERROR,
          message: `Service not available to you`,
          error: null
        })
      }
      if (env.isProd && !userManagement.canWithdraw) {
        return Promise.reject({
          status: HttpStatus.SERVICE_UNAVAILABLE,
          state: ResponseState.ERROR,
          message: `Feature not available to you`,
          error: null
        })
      }
      // if(amountBeforeFee)
      const wallet = await this.data.wallets.findOne({ userId, coin })
      if (!wallet) {
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: 'Wallet does not exists',
          error: null
        })
      }
      if (amountBeforeFee >= wallet.balance) {
        return Promise.reject({
          status: HttpStatus.BAD_REQUEST,
          state: ResponseState.ERROR,
          message: 'Insufficient balance',
          error: null
        })
      }

      const { fee, amount } = await this.utils.calculateWithdrawalFees({ amount: amountBeforeFee, coin })
      if (fee >= amountBeforeFee) {
        return Promise.reject({
          status: HttpStatus.BAD_REQUEST,
          state: ResponseState.ERROR,
          message: 'Insufficient balance',
          error: null
        })
      }
      // const response = await this.lib.withdrawal({
      //   accountId: wallet.accountId,
      //   coin,
      //   amount: String(amount),
      //   destination
      // })
      const response = await this.http.post(
        `${TATUM_BASE_URL}/offchain/withdrawal`,
        {

          senderAccountId: wallet.accountId,
          address: destination,
          amount: String(amount),
          fee: String(fee)
        },
        TATUM_CONFIG
      );
      const generalTransactionReference = generateReference('general')
      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {
          const debitedWallet = await this.data.wallets.update(
            {
              _id: wallet._id,
              balance: { $gte: amountBeforeFee },
            },
            {
              $inc: {
                balance: -amountBeforeFee,
              },
            },
            session
          );
          const txDebitPayload: OptionalQuery<Transaction> = {
            userId,
            walletId: String(wallet?._id),
            currency: coin,
            amount: amount,
            signedAmount: -amount,
            type: TRANSACTION_TYPE.DEBIT,
            description: `Withdrawal request of ${amount} ${coin}`,
            status: Status.COMPLETED,
            balanceAfter: debitedWallet?.balance,
            balanceBefore: wallet?.balance || 0,
            subType: TRANSACTION_SUBTYPE.DEBIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.WITHDRAWAL,
            metadata: response,
            generalTransactionReference,
            reference: generateReference('debit'),
          };
          const txFeePayload: OptionalQuery<Transaction> = {
            userId,
            walletId: String(wallet?._id),
            currency: coin,
            amount: fee,
            signedAmount: -fee,
            type: TRANSACTION_TYPE.DEBIT,
            description: `Charged ${fee}${coin}`,
            status: Status.COMPLETED,
            subType: TRANSACTION_SUBTYPE.FEE,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.WITHDRAWAL,
            generalTransactionReference,
            metadata: response,
            reference: generateReference('debit'),
          };
          const [transactionFactory, feeTransactionFactory] = await Promise.all([
            this.transactionFactory.create(txDebitPayload),
            this.transactionFactory.create(txFeePayload),

          ])
          const [transactionData, feeTransactionData] = await Promise.all([
            this.data.transactions.create(transactionFactory, session),
            this.data.transactions.create(feeTransactionFactory, session)
          ])

          const withdrawalPayload: OptionalQuery<Withdrawal> = {
            userId,
            transactionId: transactionData._id,
            feeTransactionId: feeTransactionData._id,
            walletId: String(wallet?._id),
            destination: {
              address: destination,
              coin,
            },
            currency: coin,
            reference: generalTransactionReference,
            type: WithdrawalType.CRYPTO,
            subType: WithdrawalSubType.AUTO,
            status: WithdrawalStatus.PENDING,
            amount,
            tatumWithdrawalId:response.id,
            tatumReference:response.reference,
            originalAmount: amountBeforeFee,
            fee,
          }
          const [withdrawalFactory, notificationFactory, activityFactory] = await Promise.all([
            this.withdrawalFactory.create(withdrawalPayload),
            this.notificationFactory.create({
              userId,
              title: 'Withdraw crypto',
              message: `Withdrawal request of ${amount} ${coin}`
            }),
            this.activityFactory.create({
              action: ActivityAction.WITHDRAWAL,
              description: 'Withdraw crypto',
              userId
            }),
          ])

          await Promise.all([
            this.data.withdrawals.create(withdrawalFactory, session),
            this.data.notifications.create(notificationFactory, session),
            this.data.activities.create(activityFactory, session),
            this.data.wallets.update({ _id: wallet._id }, { lastWithdrawal: amountBeforeFee }, session)
          ])

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
        title: `Withdraw Crypto :- ${env.env} environment`,
        message: `

          Withdraw Crypto

              User: ${email}

              Fee: ${fee}

              Amount before deduction: ${amountBeforeFee}

              Amount after deduction : ${amount}

              Message: Bought ${amount} ${coin} 


      `,
        link: env.isProd ? WITHDRAWAL_CHANNEL_LINK_PRODUCTION : WITHDRAWAL_CHANNEL_LINK_DEVELOPMENT,
      })
      return {
        message: "Withdrawals created successfully",
        status: HttpStatus.CREATED,
        data: response,
        state: ResponseState.SUCCESS
      };

      // send request to tatum




      // deduct wallet
      // withdrawal payload
      // transaction
      //store fee
      // return Promise.resolve({
      //   message: "Withdrawals created successfully",
      //   status: HttpStatus.CREATED,
      //   data: {
      //     apiResponse
      //   },
      // });

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'CRYPTO WITHDRAWAL',
        error,
        email,
        message: error.message
      }

      this.utils.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async getWithdrawals(payload: IGetWithdrawals) {
    try {
      const { q, perpage, page, dateFrom, dateTo, sortBy, orderBy } = payload
      if (q) {
        const { data, pagination } = await this.data.withdrawals.search({
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
          status: 200,
          message: "Withdrawals retrieved successfully",
          data,
          pagination,
        };
      }
      const cleanedPayload = this.cleanQueryPayload(payload)
      const { data, pagination } = await this.data.withdrawals.findAllWithPagination({
        query: cleanedPayload,
        queryFields: {},
        misc: {
          populated: {
            path: 'userId',
            select: '_id firstName lastName email phone'
          }
        }
      });

      return Promise.resolve({
        message: "Withdrawal retrieved successfully",
        status: 200,
        data,
        pagination,
      });

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

  async getSingleWithdrawal(id: mongoose.Types.ObjectId) {
    try {
      const data = await this.data.withdrawals.findOne({ _id: id });

      return Promise.resolve({
        message: "Withdrawal retrieved successfully",
        status: 200,
        data,
      });

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

  async cancelWithdrawal(payload: { userId: string, id: mongoose.Types.ObjectId, email: string }) {
    try {
      const { userId, email, id } = payload
      const withdrawal: mongoose.HydratedDocument<Withdrawal> = await this.data.withdrawals.findOne({ userId, id });
      if (!withdrawal) {
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: 'Withdrawal does not exists',
          error: null
        })
      }
      if (withdrawal.status !== WithdrawalStatus.PROCESSING) {
        return Promise.reject({
          status: HttpStatus.BAD_REQUEST,
          state: ResponseState.ERROR,
          message: 'Withdrawal already processing',
          error: null
        })
      }
      const wallet: mongoose.HydratedDocument<Wallet> = await this.data.wallets.findOne({ _id: withdrawal.walletId })
      if (!wallet) {
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: 'Wallet does not exists',
          error: null
        })
      }
      const title = 'Withdrawal cancelled'
      const description = `Withdrawal cancelled, ${withdrawal.originalAmount} ${withdrawal.currency} reversed to your ${wallet.coin} wallet`
      const generalTransactionReference = generateReference('general')

      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {
          const creditedWallet = await this.data.wallets.update(
            {
              _id: wallet._id,
            },
            {
              $inc: {
                balance: withdrawal.originalAmount,
              },
            },
            session
          );
          const transactionPayload: OptionalQuery<Transaction> = {
            userId,
            walletId: String(wallet?._id),
            currency: withdrawal.currency,
            amount: withdrawal.originalAmount,
            signedAmount: -withdrawal.originalAmount,
            type: TRANSACTION_TYPE.CREDIT,
            description,
            status: Status.COMPLETED,
            balanceAfter: creditedWallet?.balance,
            balanceBefore: wallet?.balance || 0,
            subType: TRANSACTION_SUBTYPE.REVERSAL,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.WITHDRAWAL,
            generalTransactionReference,
            reference: generateReference('credit'),
          };
          const [notificationFactory, activityFactory, transactionFactory] = await Promise.all([
            this.notificationFactory.create({
              userId,
              title,
              message: description
            }),
            this.activityFactory.create({
              action: ActivityAction.WITHDRAWAL,
              description: 'Cancelled withdrawal',
              userId
            }),
            this.transactionFactory.create(transactionPayload),

          ])

          await this.data.notifications.create(notificationFactory, session)
          await this.data.activities.create(activityFactory, session)
          await this.data.transactions.create(transactionFactory, session)
          await this.data.transactions.update({ _id: withdrawal.transactionId }, {
            status: Status.FAILED
          }, session)
          await this.data.transactions.update({ _id: withdrawal.feeTransactionId }, { status: Status.FAILED }, session)
          await this.data.wallets.update({ _id: wallet._id }, { lastDeposit: withdrawal.originalAmount }, session)

        } catch (error) {
          return Promise.reject(error)
        }
      }
      await Promise.all([
        databaseHelper.executeTransactionWithStartTransaction(
          atomicTransaction,
          this.connection
        ),
        this.discord.inHouseNotification({
          title: `Withdraw Cancelled :- ${env.env} environment`,
          message: `

              WITHDRAWAL ID:- ${withdrawal._id}

              User: ${email}

              Message: Cancelled withdrawal

      `,
          link: env.isProd ? WITHDRAWAL_CHANNEL_LINK_PRODUCTION : WITHDRAWAL_CHANNEL_LINK_DEVELOPMENT,
        })
      ])

      return Promise.resolve({
        message: "Withdrawal cancelled successfully",
        status: HttpStatus.OK,
        data: {},
      });

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
