import { HttpStatus, Injectable, Logger } from "@nestjs/common"
import {
  BASE_DIVISOR_IN_GWEI,
  env, ERC_20_TOKENS, ETH_BASE_DIVISOR_IN_WEI, TATUM_BASE_URL, TATUM_CONFIG, TATUM_PRIVATE_KEY_PIN, TATUM_PRIVATE_KEY_USER_ID, TATUM_PRIVATE_KEY_USER_NAME, TRC_20_TOKENS, TRC_20_TRON_FEE_AMOUNT, TRON_BASE_DIVISOR,
  // TATUM_BASE_URL, TATUM_CONFIG,
  // TATUM_BASE_URL, TATUM_CONFIG
} from "src/configuration"
import { IDataServices, INotificationServices } from "src/core/abstracts"
import { IHttpServices } from "src/core/abstracts/http-services.abstract"
import { ICreateWithdrawal } from "src/core/dtos/withdrawal"
import { CUSTOM_TRANSACTION_TYPE, Transaction, TRANSACTION_SUBTYPE, TRANSACTION_TYPE } from "src/core/entities/transaction.entity"
import { OptionalQuery } from "src/core/types/database"
import { ResponseState } from "src/core/types/response"
import {  Trc20TokensContractAddress, UtilsServices } from "../utils/utils.service"
import * as mongoose from "mongoose";
import { 
  // compareHash,
   decryptData, generateReference } from "src/lib/utils"
import { TransactionFactoryService } from "../transaction/transaction-factory.services"
import {
  IBtcWithdrawal,
  IEthWithdrawal,
  IGetWithdrawals,
  ITrc20Withdrawal,
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
import { ERROR_REPORTING_CHANNEL_LINK_DEVELOPMENT, ERROR_REPORTING_CHANNEL_LINK_PRODUCTION, EXTERNAL_DEPOSIT_CHANNEL_LINK, EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION, WITHDRAWAL_CHANNEL_LINK_DEVELOPMENT, WITHDRAWAL_CHANNEL_LINK_PRODUCTION } from "src/lib/constants"
import * as _ from 'lodash'
import { IErrorReporter } from "src/core/types/error"
import { Status } from "src/core/types/status"
import { WithdrawalFactoryService } from "./withdrawal-factory.service"
import { WithdrawalLib } from "./withdrawal.lib"
import { BlockchainFeesAccruedFactoryServices } from "../fees/fee-factory.service"
import { BadRequestsException } from "../user/exceptions"

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
    private readonly blockchainFeesAccured: BlockchainFeesAccruedFactoryServices,
    private readonly txFactoryServices:TransactionFactoryService,
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
      const userManagement = await this.data.userFeatureManagement.findOne({ userId:String(userId) })
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
      const [wallet, feeWallet, _] = await Promise.all([
        this.data.wallets.findOne({ userId:String(userId), coin }),
        this.data.feeWallets.findOne({ coin }),
        this.data.users.findOne({ _id:userId }),
      ])

      // const comparePin = await compareHash(pin, user?.transactionPin);
      // if (!comparePin) {
      //   return Promise.reject({
      //     status: HttpStatus.BAD_REQUEST,
      //     state: ResponseState.ERROR,
      //     error: null,
      //     message: "Transaction pin is invalid"
      //   })
      // }
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
      // check fee wallet balance on switcha
      // check 
      
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
        console.log("INSUFFICIENT BALANCE")
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
          /** no need to credit fee wallet since we are transfering all funds to the fee wallets */
          // const creditedFeeWallet = await this.data.feeWallets.update(
          //   {
          //     _id: feeWallet._id,
          //   },
          //   {
          //     $inc: {
          //       balance: fee,
          //     },
          //   },
          //   session
          // );
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
        //   if (!creditedFeeWallet) {
        //     await this.discord.inHouseNotification({
        //       title: `Withdraw Crypto :- ${env.env} environment`,
        //       message: `

        //     Fee Wallet Not Set Up Yet

        //     Coin: ${coin}

        // `,
        //       link: env.isProd ? ERROR_REPORTING_CHANNEL_LINK_PRODUCTION : ERROR_REPORTING_CHANNEL_LINK_DEVELOPMENT,
        //     })
        //     throw new Error('An error occured, please contact support')
        //   }

          const txDebitPayload: OptionalQuery<Transaction> = {
            userId,
            walletId: String(wallet?._id),
            currency: coin,
            amount: amount,
            signedAmount: -amount,
            type: TRANSACTION_TYPE.DEBIT,
            description: `Withdrawal request of ${amount} ${coin}`,
            status: Status.PENDING,
            balanceAfter: debitedWallet?.balance,
            balanceBefore: wallet?.balance || 0,
            subType: TRANSACTION_SUBTYPE.DEBIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.WITHDRAWAL,

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
            status: Status.PENDING,
            subType: TRANSACTION_SUBTYPE.FEE,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.WITHDRAWAL,
            generalTransactionReference,
            reference: generateReference('debit'),
          };

          // const txFeeWalletPayload: OptionalQuery<Transaction> = {
          //   feeWalletId: String(feeWallet?._id),
          //   currency: coin,
          //   amount: fee,
          //   signedAmount: -fee,
          //   type: TRANSACTION_TYPE.DEBIT,
          //   description: `Charged ${fee} ${coin}`,
          //   status: Status.COMPLETED,
          //   subType: TRANSACTION_SUBTYPE.FEE,
          //   customTransactionType: CUSTOM_TRANSACTION_TYPE.WITHDRAWAL,
          //   generalTransactionReference,
          //   metadata: response,
          //   reference: generateReference('debit'),
          //   balanceBefore: feeWallet.balance,
          //   balanceAfter: creditedFeeWallet.balance,
          // };
          const [transactionFactory, feeTransactionFactory] = await Promise.all([
            this.transactionFactory.create(txDebitPayload),
            this.transactionFactory.create(txFeePayload),

            // feeWalletTransactionFactory
            // this.transactionFactory.create(txFeeWalletPayload),

          ])
          const transactionData = await this.data.transactions.create(transactionFactory, session)
          const feeTransactionData = await this.data.transactions.create(feeTransactionFactory, session)
          // const feeWalletTransaction = await this.data.transactions.create(feeWalletTransactionFactory, session)

          const withdrawalPayload: OptionalQuery<Withdrawal> = {
            userId,
            transactionId: transactionData._id,
            feeTransactionId: feeTransactionData._id,
            // feeWalletTransactionId: feeWalletTransaction._id,
            walletId: String(wallet?._id),
            destination: {
              address: destination,
              coin,
            },
            walletWithdrawalType: WithdrawalWalletType.NON_CUSTODIAL,
            currency: coin,
            reference: generalTransactionReference,
            type: WithdrawalType.CRYPTO,
            subType: WithdrawalSubType.MANUAL,
            status: WithdrawalStatus.PENDING,
            amount,
            // tatumWithdrawalId: response.id,
            // blockchainTransactionId: response.txId,
            originalAmount: amountBeforeFee,

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
        message: `Withdrawal request of ${amount} ${this.utils.formatCoin(coin)} sent successfully.Withdrawal will be processed in the next 15 to 30 minute`,
        status: HttpStatus.CREATED,
        data: {},
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
        message: typeof error === 'string' ? error: 'An error occured, please contact support',
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
          status: HttpStatus.OK,
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
        status: HttpStatus.OK,
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
        status: HttpStatus.OK,
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
    const {email, from, destination, fromPrivateKey, amount, userId, walletId} = payload
    try{
      const { gasLimit, estimations } = await this.http.post(
        `${TATUM_BASE_URL}/ethereum/gas`,
        {

            from,
            to: destination,
            amount:String(amount)
        },
        TATUM_CONFIG
    )
    const { fast } = estimations

// conversion to gwei for gas price
    const convertGasPriceToGwei = _.divide(Number(fast), BASE_DIVISOR_IN_GWEI)
    const gasPrice = String(convertGasPriceToGwei)

    // convert to eth
    let gasPriceConvertToEth = _.divide(Number(fast), ETH_BASE_DIVISOR_IN_WEI)
    gasPriceConvertToEth = gasPriceConvertToEth.toFixed(18)

    const ethFee = { gasLimit, gasPrice }
    const transfer = await this.lib.withdrawalV3({
        destination,
        amount:String(amount),
        privateKey:fromPrivateKey,
        coin: 'ETH',
        ethFee
    })  
            const blockchainFeeAccuredFactory = await this.blockchainFeesAccured.create({
                action: 'withdrawal',
                coin: 'ETH',
                fee: gasPriceConvertToEth,
                description: `Transferred ${amount} ETH from master wallet ${amount} to ${destination}, fee ${gasPriceConvertToEth} ETH`,
                userId,
                walletId,
            })
            await this.data.blockchainFeesAccured.create(blockchainFeeAccuredFactory)

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

  async btcWithdrawal(payload:IBtcWithdrawal){
    const {amount, privateKey, from, email, destination} = payload
    try{
     
    let convertTo8Dp = Number(amount).toFixed(8)
      const { fast } = await this.http.post(
        `${TATUM_BASE_URL}/blockchain/estimate`,
        {

            chain: "BTC",
            type: "TRANSFER",
            fromAddress: [
                from
            ],
            to: [
                {
                    address:destination,
                    value: Number(convertTo8Dp)
                }
            ]
        },
        TATUM_CONFIG
    )

    const fee = Math.abs(Number(fast))
    // const amountAfterDeduction = _.subtract(Number(amount), fee)
        // no need to subtract gas fee

    const transfer = await this.lib.withdrawalV3({
      destination,
      amount: String(amount),
      privateKey,
      coin: 'BTC',
      from,
      fee:String(fee),
      changeAddress: from,
  })
    return transfer

    }catch(error){
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'BTC WITHDRAWAL',
        error,
        email,
        message: error.message
      }

      this.utils.errorReporter(errorPayload)
      throw new Error(error.message)
    }
  }

  async trc20Withdrawal(payload:ITrc20Withdrawal){
    const {amount, privateKey, email, destination, from} = payload
    try{

      const coinFeeWalletTrxBalance = await this.http.get(
        `${TATUM_BASE_URL}/tron/account/${from}`,

        TATUM_CONFIG
    )
    const coinFeeWalletTrxConversionBalance = _.divide(coinFeeWalletTrxBalance.balance, TRON_BASE_DIVISOR)
    if (coinFeeWalletTrxConversionBalance < Number(TRC_20_TRON_FEE_AMOUNT)) {
      Logger.error('send.to.trc20.fee.wallet', `Master usdt-tron tron's balance is less than ${TRC_20_TRON_FEE_AMOUNT}`)
      throw new Error(`Master usdt-tron tron's balance is less than ${TRC_20_TRON_FEE_AMOUNT}`)
  }
    const transfer = await this.lib.withdrawalV3({
      destination,
      amount,
      privateKey,
      coin: 'USDT_TRON',
      fee:TRC_20_TRON_FEE_AMOUNT,
      contractAddress: Trc20TokensContractAddress.USDT_TRON,
  })
    return transfer

    }catch(error){
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'USDT_TRON WITHDRAWAL',
        error,
        email,
        message: error.message
      }

      this.utils.errorReporter(errorPayload)
      throw new Error(error)
    }
  }

  async approveWithdrawals(payload:{withdrawalId:mongoose.Types.ObjectId, email:string}) {
    const {withdrawalId, email} = payload
    try{
      const withdrawal = await this.data.withdrawals.findOne({_id:withdrawalId})
      if(!withdrawal){
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: 'Withdrawal does not exists',
          error: null
        })
      }
      if(withdrawal.status === WithdrawalStatus.DENIED){
        return Promise.reject({
          status: HttpStatus.OK,
          state: ResponseState.SUCCESS,
          message: 'Withdrawal already processed',
        })
      }
      const description = `Withdrawal request of ${withdrawal.originalAmount} ${this.utils.formatCoin(withdrawal.currency) } approved`

      const feeWallet= await this.data.feeWallets.findOne({ coin:withdrawal.currency })
      if(!feeWallet){
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: 'Fee wallet does not exists',
          error: null
        })
      }
      const feeWalletBalanceOnBlockchain = await this.utils.getAddressBalanceOnTheBlockchain({address:feeWallet.address,coin:withdrawal.currency})
      if(withdrawal.amount >= Math.abs(Number(feeWalletBalanceOnBlockchain))){
        // send notification to discord
        await this.discord.inHouseNotification({
          title: `crypto.withdrawal.${env.env}`,
          message: `
            
          Coin :- ${withdrawal.currency}
          Withdrawal Amount:- ${withdrawal.amount} ${withdrawal.currency}
          Master Wallet Address On The Blockchain :- ${feeWallet.address}
          
          Master Wallet Balance On Switcha :- ${feeWalletBalanceOnBlockchain}
          
          `,
          link: env.isProd ? ERROR_REPORTING_CHANNEL_LINK_PRODUCTION : ERROR_REPORTING_CHANNEL_LINK_DEVELOPMENT,
        })
        return Promise.reject({
          status: HttpStatus.BAD_REQUEST,
          state: ResponseState.ERROR,
          message: 'Withdrawal feature currently under maintenance',
          error: null
        })
      }

      if(withdrawal.amount >= Math.abs(Number(feeWalletBalanceOnBlockchain))){
        // send notification to discord
        await this.discord.inHouseNotification({
          title: `crypto.withdrawal.${env.env}`,
          message: `
            
          Coin :- ${withdrawal.currency}

          Withdrawal Amount:- ${withdrawal.amount} ${withdrawal.currency}

          Master Wallet Address On The Blockchain :- ${feeWallet.address}
          
          Master Wallet Balance On Switcha :- ${feeWalletBalanceOnBlockchain}
          
          `,
          link: env.isProd ? ERROR_REPORTING_CHANNEL_LINK_PRODUCTION : ERROR_REPORTING_CHANNEL_LINK_DEVELOPMENT,
        })
        return Promise.reject({
          status: HttpStatus.BAD_REQUEST,
          state: ResponseState.ERROR,
          message: 'Withdrawal feature currently under maintenance',
          error: null
        })
      }
      let response

      if(withdrawal.currency === 'ETH'){
        // eth balance on the blockchain
      
        const ethPayload:IEthWithdrawal = {
          email,
          from: feeWallet.address,
          destination:withdrawal.destination.address,
          walletId:String(withdrawal.walletId),
          userId:String(withdrawal.userId),
          fromPrivateKey: decryptData({
            text: feeWallet.privateKey,
            username: TATUM_PRIVATE_KEY_USER_NAME,
            userId: TATUM_PRIVATE_KEY_USER_ID,
            pin: TATUM_PRIVATE_KEY_PIN
        }),
          amount:withdrawal.amount
        }
        response = await this.ethWithdrawal(ethPayload)
      }else if(TRC_20_TOKENS.includes(withdrawal.currency)){
        const trc20Payload:ITrc20Withdrawal = {
          amount:String(withdrawal.amount),
          privateKey:decryptData({
            text: feeWallet.privateKey,
            username: TATUM_PRIVATE_KEY_USER_NAME,
            userId: TATUM_PRIVATE_KEY_USER_ID,
            pin: TATUM_PRIVATE_KEY_PIN
        }),
          email,
          from:feeWallet.address,
          destination:withdrawal.destination.address,
        }
        response = await this.trc20Withdrawal(trc20Payload)
      }else if(withdrawal.currency === 'BTC'){
        console.log("ENTERING BTC WITHDRAWALS")
        const btcPayload:IBtcWithdrawal = {
          amount:String(withdrawal.amount),
            privateKey:  decryptData({
            text: feeWallet.privateKey,
            username: TATUM_PRIVATE_KEY_USER_NAME,
            userId: TATUM_PRIVATE_KEY_USER_ID,
            pin: TATUM_PRIVATE_KEY_PIN
        }),
        from: feeWallet.address,
        email,
        destination:withdrawal.destination.address,
      }
        response = await this.btcWithdrawal(btcPayload)

      }else if(ERC_20_TOKENS.includes(withdrawal.currency)){
        return Promise.reject({
          status: HttpStatus.BAD_REQUEST,
          state: ResponseState.ERROR,
          message: `${withdrawal.currency} withdrawal not supported`,
          error: null
        })
      }else {
        return Promise.reject({
          status: HttpStatus.BAD_REQUEST,
          state: ResponseState.ERROR,
          message: `${withdrawal.currency} withdrawal not supported`,
          error: null
        })
      }

      const atomicTransaction = async (session: mongoose.ClientSession) => {
        await this.data.transactions.update(
          { _id: withdrawal.transactionId },
          {
            status: Status.COMPLETED,
            metadata: response
          },
          session
        )

        await this.data.transactions.update(
          { _id: withdrawal.feeTransactionId },
          {
            status: Status.COMPLETED,
            metadata: response
          },
          session
        )
        await this.data.withdrawals.update(
          { _id: withdrawal._id },
          {
            status: Status.APPROVED,
            tatumWithdrawalId: response.id,
            blockchainTransactionId: response.txId,
            tatumReference: response.reference,
          },
          session
        )

        const notificationPayload = {
          userId: withdrawal.userId,
          title: "Withdrawal approved",
          message:description,
        }

        const notificationFactory = await this.notificationFactory.create(notificationPayload)
        await this.data.notifications.create(notificationFactory, session)
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

        Withdraw ${withdrawal.amount} ${withdrawal.currency} 
        
        
        TO :- ${withdrawal.destination.address}


        BODY : ${JSON.stringify(payload)}
`,
        link: env.isProd ? EXTERNAL_DEPOSIT_CHANNEL_LINK_PRODUCTION : EXTERNAL_DEPOSIT_CHANNEL_LINK,
      })
      // state last withdrawal
      // update transaction status and reference
      // store reference
      return { message: description, status: HttpStatus.OK, data: response, state:ResponseState.SUCCESS }

    }catch(error){
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'CRYPTO WITHDRAWAL APPROVAL',
        error,
        email,
        message: error.message
      }

      this.utils.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: typeof error === 'string' ? error: 'An error occured, please contact support',
        error: error
      })    }
  }

  async denyWithdrawal(payload:{withdrawalId:mongoose.Types.ObjectId, email:string}) {
    const {withdrawalId, email} = payload
    try{
      const withdrawal = await this.data.withdrawals.findOne({_id:withdrawalId})
      if(!withdrawal){
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: 'Withdrawal does not exists',
          error: null
        })
      }
      if(withdrawal.status !== WithdrawalStatus.PENDING){
        return Promise.reject({
          status: HttpStatus.OK,
          state: ResponseState.SUCCESS,
          message: 'Withdrawal already processed',
        })
      }
      const wallet = await this.data.wallets.findOne({_id:withdrawal.walletId})
      const description = `Withdrawal request of ${withdrawal.originalAmount} ${this.utils.formatCoin(withdrawal.currency) } denied`

      const atomicTransaction = async (session: mongoose.ClientSession) => {
        await this.data.transactions.update(
          { _id: withdrawal.transactionId },
          {
            status: Status.DENIED,
          },
          session
        )

        await this.data.transactions.update(
          { _id: withdrawal.feeTransactionId },
          {
            status: Status.DENIED,
          },
          session
        )
        await this.data.transactions.update(
          { _id: withdrawal.feeWalletTransactionId },
          {
            status: Status.DENIED,
          },
          session
        )
        await this.data.withdrawals.update(
          { _id: withdrawal._id },
          {
            status: Status.DENIED,

          },
          session
        )

        const creditedWallet = await this.data.wallets.update(
          {
            _id: withdrawal.walletId,
          },
          {
            $inc: {
              balance: withdrawal.originalAmount,
            },
            lastDeposit: withdrawal.originalAmount
          },
          session
        );
        if (!creditedWallet) {
          Logger.error("Error Occurred");
          throw new BadRequestsException("Error Occurred");
        }

        const txCreditPayload = {
          userId: withdrawal.userId,
          walletId: withdrawal.walletId,
          currency: withdrawal.currency,
          amount:withdrawal.originalAmount,
          signedAmount:withdrawal.originalAmount,
          type: TRANSACTION_TYPE.CREDIT,
          description,
          status: Status.COMPLETED,
          balanceAfter: creditedWallet?.balance,
          balanceBefore: wallet?.balance,
          subType: TRANSACTION_SUBTYPE.REVERSAL,
          customTransactionType: CUSTOM_TRANSACTION_TYPE.WITHDRAWAL,
          reference: generateReference('credit'),
        };

        const notificationPayload = {
          userId: wallet.userId,
          title: "Withdrawal denied",
          message:description,
        }

        const [notificationFactory, txCreditFactory] = await Promise.all([
          this.notificationFactory.create(notificationPayload),
          this.txFactoryServices.create(txCreditPayload)
        ])
        await this.data.transactions.create(txCreditFactory, session)
        await this.data.notifications.create(notificationFactory, session)

      }
      await databaseHelper.executeTransactionWithStartTransaction(
        atomicTransaction,
        this.connection
      )

      return { 
        message:description,
       status: HttpStatus.OK, 
       data: {}, 
       state:ResponseState.SUCCESS 
      }

    }catch(error){
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'CRYPTO WITHDRAWAL DENIAL',
        error,
        email,
        message: error.message
      }

      this.utils.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: typeof error === 'string' ? error: 'An error occured, please contact support',
        error: error
      })    }
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

// https://live.blockcypher.com/btc-testnet/tx/00c0d9638e14129a0b54bd13cc905406b13ea86bf69323e0dcfc8c66e7ac1f75/



// {
//   chain: 'BTC',
//   type: 'TRANSFER',
//   fromAddress: [ 'tb1qcqn0qxtrp96yzwww5nwjmer56qykna4jdzkrqj' ],
//   to: [
//     {
//       address: 'tb1qpu4w7tsuse73k8glf4mc5n430q44xerfv7j7m5',
//       value: 0.00010000000000000005
//     }
//   ]
// }


// {
//   fromAddress: [
//     {
//       address: 'tb1qcqn0qxtrp96yzwww5nwjmer56qykna4jdzkrqj',
//       privateKey: 'cQKufonyMWYfy4pZLCq94NZfch1kS7KGfVcwLyXe2x4gzVFAGtub'
//     }
//   ],
//   to: [
//     {
//       address: 'tb1qpu4w7tsuse73k8glf4mc5n430q44xerfv7j7m5',
//       value: 0.00055116
//     }
//   ],
//   fee: '0.00004884',
//   changeAddress: 'tb1qcqn0qxtrp96yzwww5nwjmer56qykna4jdzkrqj'
// }