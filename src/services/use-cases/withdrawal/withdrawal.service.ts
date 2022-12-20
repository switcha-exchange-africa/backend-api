import { HttpStatus, Injectable, Logger } from "@nestjs/common"
import {
  env, TATUM_BASE_URL, TATUM_CONFIG, TATUM_PRIVATE_KEY_PIN, TATUM_PRIVATE_KEY_USER_ID, TATUM_PRIVATE_KEY_USER_NAME,
  // TATUM_BASE_URL, TATUM_CONFIG,
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
import { decryptData, generateReference } from "src/lib/utils"
import { TransactionFactoryService } from "../transaction/transaction-factory.services"
import {
  IEthWithdrawal,
  IGetWithdrawals,
  Withdrawal,
  WithdrawalStatus,
  WithdrawalSubType,
  WithdrawalType,
  WithdrawalWalletType,
  //  WithdrawalSubType, WithdrawalType
} from "src/core/entities/Withdrawal"
import { Wallet } from "src/core/entities/wallet.entity"
// import { WithdrawalFactoryService } from "./withdrawal-factory.service"
import { NotificationFactoryService } from "../notification/notification-factory.service"
import { ActivityFactoryService } from "../activity/activity-factory.service"
import { ActivityAction } from "src/core/dtos/activity"
import databaseHelper from "src/frameworks/data-services/mongo/database-helper"
import { InjectConnection } from "@nestjs/mongoose"
import { ERROR_REPORTING_CHANNEL_LINK_DEVELOPMENT, ERROR_REPORTING_CHANNEL_LINK_PRODUCTION, WITHDRAWAL_CHANNEL_LINK_DEVELOPMENT, WITHDRAWAL_CHANNEL_LINK_PRODUCTION } from "src/lib/constants"
import * as _ from 'lodash'
import { IErrorReporter } from "src/core/types/error"
import { Status } from "src/core/types/status"
import { WithdrawalFactoryService } from "./withdrawal-factory.service"
import { WithdrawalLib } from "./withdrawal.lib"

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
    private readonly lib: WithdrawalLib,
    @InjectConnection('switcha') private readonly connection: mongoose.Connection

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
      const userManagement = await this.data.userFeatureManagement.findOne({ userId })
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
      const [wallet, feeWallet] = await Promise.all([
        this.data.wallets.findOne({ userId, coin }),
        this.data.feeWallets.findOne({ coin }),
      ])
      if (!wallet) {
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: 'Wallet does not exists',
          error: null
        })
      }
      if (!feeWallet) {
        await this.discord.inHouseNotification({
          title: `Withdraw Crypto :- ${env.env} environment`,
          message: `
  
            Fee Wallet Not Set Up Yet

            Coin: ${coin}
  
        `,
          link: env.isProd ? ERROR_REPORTING_CHANNEL_LINK_PRODUCTION : ERROR_REPORTING_CHANNEL_LINK_DEVELOPMENT,
        })
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: 'An error occured, please contact support',
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
      let getIndex

      if (!wallet.derivationKey) {
        const getWalletsFromVirtualAccounts = await this.http.get(`${TATUM_BASE_URL}/offchain/account/${wallet.accountId}/address`, TATUM_CONFIG)
        for (const element of getWalletsFromVirtualAccounts) {
          if (element.address === wallet.address) {
            getIndex = element.derivationKey
          }
        }
      }

      // const index = wallet.derivationKey ? Number(wallet.derivationKey) : Number(getIndex)

      let response 
      if(coin === 'ETH'){
        const ethPayload:IEthWithdrawal = {
          email,
          from: feeWallet.address,
          destination,
          fromPrivateKey: decryptData({
            text: feeWallet.privateKey,
            username: TATUM_PRIVATE_KEY_USER_NAME,
            userId: TATUM_PRIVATE_KEY_USER_ID,
            pin: TATUM_PRIVATE_KEY_PIN
        }),
          amount
        }
        response = await this.ethWithdrawal(ethPayload)
      }
    

      const generalTransactionReference = generateReference('general')
      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {
          if (!wallet.derivationKey) await this.data.wallets.update({ _id: wallet._id }, { derivationKey: getIndex }, session)

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
          const creditedFeeWallet = await this.data.feeWallets.update(
            {
              _id: feeWallet._id,
            },
            {
              $inc: {
                balance: fee,
              },
            },
            session
          );
          if (!debitedWallet) {
            await this.discord.inHouseNotification({
              title: `Withdraw Crypto :- ${env.env} environment`,
              message: `

            Debiting user failed

            Coin: ${coin}

        `,
              link: env.isProd ? ERROR_REPORTING_CHANNEL_LINK_PRODUCTION : ERROR_REPORTING_CHANNEL_LINK_DEVELOPMENT,
            })
            throw new Error('An error occured, please contact support')
          }
          if (!creditedFeeWallet) {
            await this.discord.inHouseNotification({
              title: `Withdraw Crypto :- ${env.env} environment`,
              message: `

            Fee Wallet Not Set Up Yet

            Coin: ${coin}

        `,
              link: env.isProd ? ERROR_REPORTING_CHANNEL_LINK_PRODUCTION : ERROR_REPORTING_CHANNEL_LINK_DEVELOPMENT,
            })
            throw new Error('An error occured, please contact support')
          }

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
            description: `Charged ${fee} ${coin}`,
            status: Status.COMPLETED,
            subType: TRANSACTION_SUBTYPE.FEE,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.WITHDRAWAL,
            generalTransactionReference,
            metadata: response,
            reference: generateReference('debit'),
          };

          const txFeeWalletPayload: OptionalQuery<Transaction> = {
            feeWalletId: String(feeWallet?._id),
            currency: coin,
            amount: fee,
            signedAmount: -fee,
            type: TRANSACTION_TYPE.DEBIT,
            description: `Charged ${fee} ${coin}`,
            status: Status.COMPLETED,
            subType: TRANSACTION_SUBTYPE.FEE,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.WITHDRAWAL,
            generalTransactionReference,
            metadata: response,
            reference: generateReference('debit'),
            balanceBefore: feeWallet.balance,
            balanceAfter: creditedFeeWallet.balance,
          };
          const [transactionFactory, feeTransactionFactory, feeWalletTransactionFactory] = await Promise.all([
            this.transactionFactory.create(txDebitPayload),
            this.transactionFactory.create(txFeePayload),

            this.transactionFactory.create(txFeeWalletPayload),

          ])
          const transactionData = await this.data.transactions.create(transactionFactory, session)
          const feeTransactionData = await this.data.transactions.create(feeTransactionFactory, session)
          const feeWalletTransaction = await this.data.transactions.create(feeWalletTransactionFactory, session)

          const withdrawalPayload: OptionalQuery<Withdrawal> = {
            userId,
            transactionId: transactionData._id,
            feeTransactionId: feeTransactionData._id,
            feeWalletTransactionId: feeWalletTransaction._id,
            walletId: String(wallet?._id),
            destination: {
              address: destination,
              coin,
            },
            walletWithdrawalType: WithdrawalWalletType.CUSTODIAL,
            currency: coin,
            reference: generalTransactionReference,
            type: WithdrawalType.CRYPTO,
            subType: WithdrawalSubType.AUTO,
            status: WithdrawalStatus.APPROVED,
            amount,
            tatumWithdrawalId: response.id,
            blockchainTransactionId: response.txId,
            tatumReference: response.reference,
            originalAmount: amountBeforeFee,
            metadata: response,
            fee,
          }
          const [withdrawalFactory, notificationFactory, activityFactory] = await Promise.all([
            this.withdrawalFactory.create(withdrawalPayload),
            this.notificationFactory.create({
              userId,
              title: 'Withdraw Crypto',
              message: `Withdrawal request of ${amount} ${coin}`
            }),
            this.activityFactory.create({
              action: ActivityAction.WITHDRAWAL,
              description: 'Withdraw crypto',
              userId
            }),
          ])

          await this.data.withdrawals.create(withdrawalFactory, session)
          await this.data.notifications.create(notificationFactory, session)
          await this.data.activities.create(activityFactory, session)
          await this.data.wallets.update({ _id: wallet._id }, { lastWithdrawal: amountBeforeFee }, session)
          await this.data.feeWallets.update({ _id: feeWallet._id }, { lastWithdrawal: amountBeforeFee }, session)


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

              Destination: ${destination}
              
              Amount before deduction: ${amountBeforeFee}

              Amount after deduction : ${amount}

              Message: Withdraw ${amount} ${coin} 


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
        message: 'An error occured, please contact support',
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

  async ethWithdrawal(payload:IEthWithdrawal){
    const {email, from, destination, fromPrivateKey, amount} = payload
    try{
      const { gasLimit, estimations } = await this.http.post(
        `${TATUM_BASE_URL}/ethereum/gas`,
        {

            from,
            to: destination,
            amount
        },
        TATUM_CONFIG
    )
    const { standard } = estimations

    const gasPrice = standard
    const ethFee = { gasLimit, gasPrice }

    const transfer = await this.lib.withdrawalV3({
        destination,
        amount:String(amount),
        privateKey:fromPrivateKey,
        coin: 'ETH',
        ethFee
    })

    return transfer
    }catch(error){
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'ETH WITHDRAWAL',
        error,
        email,
        message: error.message
      }

      this.utils.errorReporter(errorPayload)
      throw new Error(error)
    }
  }

}


  /**
       * activate wallet for tron/usdt_tron addresses
       */
  // if (wallet.coin === 'USDT_TRON' || wallet.coin === 'TRON') {

  //   const getFeeTronWallet = await this.data.feeWallets.findOne({ coin: 'TRON' })
  //   if (!getFeeTronWallet) {
  //     await this.discord.inHouseNotification({
  //       title: `Tron network withdrawal :- ${env.env} environment`,
  //       message: `
        
  //       Tron wallet not yet set, please set it up on production

  //     `,
  //       link: TRON_ADDRESS_MONITOR_CHANNEL,
  //     })
  //     return Promise.reject({
  //       status: HttpStatus.BAD_REQUEST,
  //       state: ResponseState.ERROR,
  //       message: `TRON/TRC-10/TRC-20 withdrawals not supported yet, please contact support`,
  //       error: null
  //     })
  //   }

  //   if (getFeeTronWallet.balance < amount) {

  //     await this.discord.inHouseNotification({
  //       title: `Tron network withdrawal :- ${env.env} environment`,
  //       message: `
        
  //       Tron master wallet balance is low

  //       Balance:- ${getFeeTronWallet.balance}

  //     `,
  //       link: TRON_ADDRESS_MONITOR_CHANNEL,
  //     })

  //     return Promise.reject({
  //       status: HttpStatus.BAD_REQUEST,
  //       state: ResponseState.ERROR,
  //       message: `TRON/TRC-10/TRC-20 withdrawals disabled, please contact support`,
  //       error: null
  //     })
  //   }
  //   const getTrxBalance = await this.http.get(
  //     `${TATUM_BASE_URL}/tron/account/${wallet.address}`,

  //     TATUM_CONFIG
  //   )
  //   const divisor = 1000000
  //   const trxBalance = getTrxBalance.balance / divisor
  //   // send tron to activate wallet
  //   const tronAmount = '12.798'
  //   if (trxBalance < Number(tronAmount)) {
  //     const transferTron = await this.lib.withdrawal({
  //       accountId: getFeeTronWallet.accountId,
  //       coin: 'TRON',
  //       amount: tronAmount,
  //       destination: wallet.address,
  //       index: getFeeTronWallet.derivationKey
  //     })

  //     await this.data.wallets.update({ _id: wallet._id }, { isActivated: true })
  //     await this.discord.inHouseNotification({
  //       title: `Tron network withdrawal :- ${env.env} environment`,
  //       message: `
        
  //       Transfer successful!!

  //       ${tronAmount} TRX sent to ${wallet.address}

  //       user: ${email}

  //       Transaction Details:- ${JSON.stringify(transferTron)}

  //     `,
  //       link: TRON_ADDRESS_MONITOR_CHANNEL,
  //     })
  //   }


  // }

  /**
* activate wallet for tron/usdt_tron addresses
*/