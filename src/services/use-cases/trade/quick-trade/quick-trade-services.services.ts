import { InjectConnection } from "@nestjs/mongoose";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
// import { IHttpServices } from "src/core/abstracts/http-services.abstract";
import { IDataServices } from "src/core/abstracts";
// import { TATUM_API_KEY } from "src/configuration";
import * as mongoose from "mongoose";
import { TransactionFactoryService } from "../../transaction/transaction-factory.services";
import { ResponsesType } from "src/core/types/response";
// import { NotificationFactoryService } from "../../notification/notification-factory.service";
import { IQuickTradeBuy, IQuickTradeSell } from "src/core/dtos/trade/quick-trade.dto";
import databaseHelper from "src/frameworks/data-services/mongo/database-helper";
import { BadRequestsException } from "../../user/exceptions";
import { QuickTradeContractFactoryService, QuickTradeFactoryService } from "./quick-trade-factory.service";
import { QuickTradeContractStatus, QuickTradeStatus, QuickTradeType } from "src/core/entities/QuickTrade";
import { generateReference } from "src/lib/utils";
import { CUSTOM_TRANSACTION_TYPE, TRANSACTION_STATUS, TRANSACTION_SUBTYPE, TRANSACTION_TYPE } from "src/core/entities/transaction.entity";

@Injectable()
export class QuickTradeServices {

  constructor(
    // private http: IHttpServices,
    private data: IDataServices,
    private quickTradeFactory: QuickTradeFactoryService,
    private quickTradeContractFactory: QuickTradeContractFactoryService,
    private transactionFactory: TransactionFactoryService,
    // private discord: INotificationServices,
    // private notificationFactory: NotificationFactoryService,
    @InjectConnection() private readonly connection: mongoose.Connection

  ) { }

  async buyAd(payload: IQuickTradeBuy): Promise<ResponsesType<any>> {
    try {
      const { userId, buy, payingCoin, unitPrice, amount } = payload
      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {

          const price = unitPrice * amount  // total price
          const [creditWallet, debitWallet] = await Promise.all([
            this.data.wallets.findOne({ userId, coin: buy, isBlocked: false }, session),
            this.data.wallets.findOne({ userId, coin: payingCoin, balance: { $gte: price } }, session),
          ])

          if (!creditWallet) throw new BadRequestsException("Wallet does not exists")
          if (!debitWallet) throw new BadRequestsException("Insufficient Balance")

          // deducting the total price from the coin used to pay
          const debitedWallet = await this.data.wallets.update({ _id: debitWallet._id },
            {
              $inc: {
                balance: -price,
              },
              lastWithdrawal: price
            },
            session
          );
          const generalTransactionReference = generateReference('general')
          const pair = `${buy}/${payingCoin}`

          const txDebitPayload = {
            userId,
            walletId: debitWallet?._id,
            currency: payingCoin,
            amount: amount,
            signedAmount: -amount,
            type: TRANSACTION_TYPE.DEBIT,
            description: `Placed a buy ad for ${amount}${buy}`,
            status: TRANSACTION_STATUS.COMPLETED,
            balanceAfter: debitedWallet?.balance,
            balanceBefore: debitWallet?.balance,
            subType: TRANSACTION_SUBTYPE.DEBIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.QUICK_TRADE,
            rate: {
              pair,
              rate: price
            },
            generalTransactionReference,
            reference: generateReference('debit'),
          };
          const quickTradePayload = {
            buyerId: userId,
            type: QuickTradeType.BUY,
            pair,
            unitPrice,
            price,
            amount
          }

          const [quickTradeFactory, transactionFactory] = await Promise.all([
            this.quickTradeFactory.create(quickTradePayload),
            this.transactionFactory.create(txDebitPayload)
          ])
          const quickTrade = await this.data.quickTrades.create(quickTradeFactory, session)

          const quickTradeContractPayload = {
            quickTradeId: String(quickTrade._id),
            price,
            status: QuickTradeContractStatus.PENDING,
            generalTransactionReference,

          }
          const quickTradeContractFactory = await this.quickTradeContractFactory.create(quickTradeContractPayload)

          await Promise.all([
            this.data.quickTradeContracts.create(quickTradeContractFactory, session),
            this.data.transactions.create(transactionFactory, session)
          ])

        } catch (error) {
          Logger.error(error);
          return Promise.reject(error);
        }
      };
      await databaseHelper.executeTransaction(
        atomicTransaction,
        this.connection
      )

      return {
        message: `Buy ads added successfully`,
        data: {},
        status: HttpStatus.OK,
      };
    } catch (error) {
      Logger.error(error);
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "An error occured, please contact support",
        technical: error.message,
        state: 'error',
        error
      });
    }
  }

  async sell(payload: IQuickTradeSell): Promise<ResponsesType<any>> {

    try {
      const { userId, sell, acceptingCoin, price, amount } = payload

      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {
          const [creditWallet, debitWallet] = await Promise.all([
            this.data.wallets.findOne({ userId, coin: acceptingCoin, isBlocked: false }, session),
            this.data.wallets.findOne({ userId, coin: sell, balance: { $gte: amount } }, session),
          ])
          if (!creditWallet) throw new BadRequestsException("Wallet does not exists")
          if (!debitWallet) throw new BadRequestsException("Insufficient Balance")

          const debitedWallet = await this.data.wallets.update({ _id: creditWallet._id },
            {
              $inc: {
                balance: price,
              },
            },
            session
          );

          const generalTransactionReference = generateReference('general')
          const pair = `${sell}/${acceptingCoin}`

          const txCreditPayload = {
            userId,
            walletId: debitWallet?._id,
            currency: sell,
            amount: price,
            signedAmount: price,
            type: TRANSACTION_TYPE.DEBIT,
            description: `Created a sell ad of ${amount}${sell}`,
            status: TRANSACTION_STATUS.PENDING,
            balanceAfter: debitedWallet?.balance,
            balanceBefore: debitWallet?.balance,
            subType: TRANSACTION_SUBTYPE.DEBIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.QUICK_TRADE,
            rate: {
              pair,
              rate: price
            },
            generalTransactionReference,
            reference: generateReference('debit'),
          };
          const quickTradePayload = {
            buyerId: userId,
            type: QuickTradeType.SELL,
            pair,
            price,
            amount
          }
          const matchingQuickTrade = await this.data.quickTrades.findOne({ pair, price, type: QuickTradeType.BUY, amount: { $lte: amount } }, session)
          if (matchingQuickTrade) {
            // get matching quick trade contract
            const matchingQuickTradeContract = await this.data.quickTradeContracts.findOne({ quickTradeId: matchingQuickTrade._id, status: QuickTradeContractStatus.PENDING }, session)
            if (matchingQuickTradeContract.amount < amount) {
              // fill trade
              await Promise.all([
                this.data.transactions.update({ generalTransactionReference: matchingQuickTradeContract.generalTransactionReference }, {
                  status: TRANSACTION_STATUS.COMPLETED
                }, session),
                this.data.quickTrades.update({ _id: matchingQuickTrade._id }, { status: QuickTradeStatus.FILLED, filledDate: new Date() }, session),
                this.data.wallets.update({ id: creditWallet.id }, {
                  $inc: {
                    balance: price,
                  },
                  lastDeposit: price
                },
                  session)
              ])
              Logger.log(`QUICK TRADE BUY AD OF ID ${matchingQuickTrade._id} filled`)
              return `QUICK TRADE BUY AD OF ID ${matchingQuickTrade._id} filled`
            }

            // get update transaction to successfull
            // fill or partial fill the trade
            // send notification
          }
          const [quickTradeFactory, transactionFactory] = await Promise.all([
            this.quickTradeFactory.create(quickTradePayload),
            this.transactionFactory.create(txCreditPayload)
          ])
          const quickTrade = await this.data.quickTrades.create(quickTradeFactory, session)

          const quickTradeContractPayload = {
            quickTradeId: String(quickTrade._id),
            amount,
            status: QuickTradeContractStatus.PENDING,
            generalTransactionReference,

          }
          const quickTradeContractFactory = await this.quickTradeContractFactory.create(quickTradeContractPayload)

          await Promise.all([
            this.data.quickTradeContracts.create(quickTradeContractFactory, session),
            this.data.transactions.create(transactionFactory, session)
          ])
          return 'Quick Trade Sell Ad Created Successfully'
        } catch (error) {
          Logger.error(error);
          throw new Error(error);
        }
      };
      await databaseHelper.executeTransaction(
        atomicTransaction,
        this.connection
      )
      return {
        message: `Buy ads added successfully`,
        data: {},
        status: HttpStatus.OK,
      };
    } catch (error) {
      console.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }

  async getBuyAds(payload: { perpage: string, page: string, dateFrom: string, dateTo: string, sortBy: string, orderBy: string, userId: string }) {
    try {

      const { data, pagination } = await this.data.quickTrades.findAllWithPagination({
        query: payload,
        queryFields: {},
        misc: {
          populated: {
            path: 'buyerId',
            select: '_id firstName lastName email phone'
          }
        }
      });

      return Promise.resolve({
        message: "Transaction retrieved successfully",
        status: 200,
        data,
        pagination,
      });

    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }
}
