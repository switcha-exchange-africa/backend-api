import { InjectConnection } from "@nestjs/mongoose";
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
// import { IHttpServices } from "src/core/abstracts/http-services.abstract";
import { IDataServices, INotificationServices } from "src/core/abstracts";
// import { TATUM_API_KEY } from "src/configuration";
import * as mongoose from "mongoose";
import { TransactionFactoryService } from "../../transaction/transaction-factory.services";
import { ResponseState, ResponsesType } from "src/core/types/response";
import { NotificationFactoryService } from "../../notification/notification-factory.service";
import { IQuickTradeBuy, IQuickTradeBuyV2, IQuickTradeSell } from "src/core/dtos/trade/quick-trade.dto";
import databaseHelper from "src/frameworks/data-services/mongo/database-helper";
import { QuickTradeContractFactoryService, QuickTradeFactoryService } from "./quick-trade-factory.service";
import { QuickTrade, QuickTradeContract, QuickTradeContractStatus, QuickTradeStatus, QuickTradeType } from "src/core/entities/QuickTrade";
import { generateReference } from "src/lib/utils";
import { CUSTOM_TRANSACTION_TYPE, TRANSACTION_STATUS, TRANSACTION_SUBTYPE, TRANSACTION_TYPE } from "src/core/entities/transaction.entity";
import { env } from "src/configuration";
import { QUICK_TRADE_CHANNEL_LINK_DEVELOPMENT, QUICK_TRADE_CHANNEL_LINK_PRODUCTION } from "src/lib/constants";
import { User } from "src/core/entities/user.entity";
import * as _ from 'lodash';
import { IErrorReporter } from "src/core/types/error";
import { UtilsServices } from "../../utils/utils.service";
import { Status } from "src/core/types/status";
import { P2pOrderFactoryService } from "../p2p/p2p-factory.service";
import { P2pAdsType } from "src/core/entities/P2pAds";
import { IActivity } from "src/core/entities/Activity";
import { P2pOrderType } from "src/core/dtos/p2p";
import { ActivityAction } from "src/core/dtos/activity";
import { INotification } from "src/core/entities/notification.entity";
import { Queue } from "bull";
import { InjectQueue } from "@nestjs/bull";

@Injectable()
export class QuickTradeServices {

  constructor(
    private data: IDataServices,
    private quickTradeFactory: QuickTradeFactoryService,
    private quickTradeContractFactory: QuickTradeContractFactoryService,
    private transactionFactory: TransactionFactoryService,
    private discord: INotificationServices,
    private notificationFactory: NotificationFactoryService,
    private readonly utilsService: UtilsServices,
    private readonly orderFactory: P2pOrderFactoryService,
    @InjectQueue('order.expiry') private orderQueue: Queue,
    @InjectConnection() private readonly connection: mongoose.Connection

  ) { }

  async buyAd(payload: IQuickTradeBuy): Promise<ResponsesType<QuickTrade>> {
    try {
      const { userId, buy, payingCoin, unitPrice, amount, fullName } = payload
      const price = unitPrice * amount  // total price
      const generalTransactionReference = generateReference('general')
      const pair = `${buy}/${payingCoin}`

      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {

          const [creditWallet, debitWallet] = await Promise.all([
            this.data.wallets.findOne({ userId, coin: buy, isBlocked: false }),
            this.data.wallets.findOne({ userId, coin: payingCoin, balance: { $gte: price } }),
          ])
          if (!creditWallet) return Promise.reject({
            status: HttpStatus.NOT_FOUND,
            state: ResponseState.ERROR,
            message: `${buy} wallet does not exist`,
            error: null,
          });
          if (!debitWallet) return Promise.reject({
            status: HttpStatus.NOT_FOUND,
            state: ResponseState.ERROR,
            message: "Insufficient Balance",
            error: null,
          });

          const matchingTrade: mongoose.HydratedDocument<QuickTrade> = await this.data.quickTrades.findOne({ type: QuickTradeType.SELL, unitPrice, pair, amount: { $lte: amount }, status: { $ne: QuickTradeStatus.FILLED } })
          const matchingTradeContract: mongoose.HydratedDocument<QuickTradeContract> = await this.data.quickTradeContracts.findOne({ quickTradeId: String(matchingTrade._id) }) // credit the user acceptingCoin wallet with the price

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

          const txDebitPayload = {
            userId,
            walletId: String(debitWallet?._id),
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
          if (matchingTrade) {

            const seller = matchingTrade.sellerId as unknown as mongoose.HydratedDocument<User>
            const sellerWallet = await this.data.wallets.findOne({ coin: buy, userId: String(seller._id) })
            if (!sellerWallet) return Promise.reject({
              status: HttpStatus.BAD_REQUEST,
              state: ResponseState.ERROR,
              message: 'Buyer wallet does not exists',
              error: null,
            });

            const sellerPendingTransaction = await this.data.transactions.findOne({ generalTransactionReference: matchingTradeContract.generalTransactionReference })
            if (!sellerPendingTransaction) return Promise.reject({
              status: HttpStatus.BAD_REQUEST,
              state: ResponseState.ERROR,
              message: `Group Transaction Reference of ${matchingTradeContract.generalTransactionReference} does not exists`,
              error: null,
            });

            const sellerNotificationPayload = {
              message: `Your sell ad of ${matchingTrade.amount}${matchingTrade.pair} has been matched and filled`,
              title: `Credit Alert:- Quick Trade`,
              userId
            }
            const sellerNotificationFactory = await this.notificationFactory.create(sellerNotificationPayload)

            const [, , sellerCreditedWallet, ,] = await Promise.all([
              this.data.quickTradeContracts.update({ quickTradeId: String(matchingTrade._id) }, { status: QuickTradeContractStatus.COMPLETED }, session), // update contract
              this.data.quickTrades.update({ _id: matchingTrade._id }, {
                status: QuickTradeStatus.FILLED,
                filledDate: new Date(),
                buyerId: String(userId)
              }, session),
              this.data.wallets.update({ _id: sellerWallet._id }, {
                $inc: {
                  balance: amount,
                },
                lastDeposit: amount
              }, session),
              this.data.notifications.create(sellerNotificationFactory, session),
              this.data.transactions.update({ _id: sellerPendingTransaction._id }, { status: TRANSACTION_STATUS.COMPLETED }, session)
            ])

            const sellerCreditTransactionPayload = {
              userId: String(seller._id),
              walletId: String(sellerWallet?._id),
              currency: sellerWallet.coin,
              amount: amount,
              signedAmount: amount,
              type: TRANSACTION_TYPE.CREDIT,
              description: `Your seller ad of ${matchingTrade.amount}${matchingTrade.pair} has been matched and filled`,
              status: TRANSACTION_STATUS.COMPLETED,
              balanceAfter: sellerCreditedWallet?.balance,
              balanceBefore: sellerWallet?.balance,
              subType: TRANSACTION_SUBTYPE.CREDIT,
              customTransactionType: CUSTOM_TRANSACTION_TYPE.QUICK_TRADE,
              rate: {
                pair,
                rate: unitPrice
              },
              generalTransactionReference: matchingTradeContract.generalTransactionReference,
              reference: generateReference('credit'),
            }

            const sellerCreditTransactionFactory = await this.transactionFactory.create(sellerCreditTransactionPayload)
            this.data.transactions.create(sellerCreditTransactionFactory, session)

            if (matchingTrade.amount === amount) {

              const buyerNotificationPayload = {
                message: `Your buy ad of ${amount}${buy} has been matched and filled`,
                title: `Credit Alert:- Quick Trade`,
                userId
              }
              const buyerNotificationFactory = await this.notificationFactory.create(buyerNotificationPayload)

              const [buyerCreditedWallet,] = await Promise.all([
                this.data.wallets.update({ _id: creditWallet._id }, {
                  $inc: {
                    balance: matchingTradeContract.price,
                  },
                  lastDeposit: matchingTradeContract.price
                }, session),
                this.data.notifications.create(buyerNotificationFactory, session),
              ])
              const buyerCreditTransactionPayload = {
                userId,
                walletId: String(creditWallet?._id),
                currency: creditWallet?.coin,
                amount: matchingTradeContract.price,
                signedAmount: matchingTradeContract.price,
                type: TRANSACTION_TYPE.CREDIT,
                description: `Your buy ad of ${amount}${buy} has been matched and filled`,
                status: TRANSACTION_STATUS.COMPLETED,
                balanceAfter: buyerCreditedWallet?.balance,
                balanceBefore: creditWallet?.balance,
                subType: TRANSACTION_SUBTYPE.CREDIT,
                customTransactionType: CUSTOM_TRANSACTION_TYPE.QUICK_TRADE,
                rate: {
                  pair,
                  rate: unitPrice
                },
                generalTransactionReference,
                reference: generateReference('credit'),
              }

              const buyerCreditTransactionFactory = await this.transactionFactory.create(buyerCreditTransactionPayload)
              await this.data.transactions.create(buyerCreditTransactionFactory, session)


              return
            }

            const buyerNotificationPayload = {
              message: `Your sell ad of ${amount}${buy} has been matched and partially filled`,
              title: `Credit Alert:- Quick Trade`,
              userId
            }
            const buyerNotificationFactory = await this.notificationFactory.create(buyerNotificationPayload)

            const remainingAmount = Math.abs(_.subtract(amount, matchingTrade.amount))
            const priceToPayBuyer = _.multiply(matchingTrade.amount, unitPrice)

            const [buyerCreditedWallet, ,] = await Promise.all([
              this.data.wallets.update({ _id: creditWallet._id }, {
                $inc: {
                  balance: priceToPayBuyer,
                },
                lastDeposit: priceToPayBuyer
              }, session),

              this.data.notifications.create(buyerNotificationFactory, session),
            ])

            const buyerCreditTransactionPayload = {
              userId,
              walletId: String(creditWallet?._id),
              currency: creditWallet?.coin,
              amount: priceToPayBuyer,
              signedAmount: priceToPayBuyer,
              type: TRANSACTION_TYPE.CREDIT,
              description: `Your buy ad of ${amount}${buy} has been matched and partially filled`,
              status: TRANSACTION_STATUS.COMPLETED,
              balanceAfter: buyerCreditedWallet?.balance,
              balanceBefore: creditWallet?.balance,
              subType: TRANSACTION_SUBTYPE.CREDIT,
              customTransactionType: CUSTOM_TRANSACTION_TYPE.QUICK_TRADE,
              rate: {
                pair,
                rate: unitPrice
              },
              generalTransactionReference,
              reference: generateReference('credit'),
            }
            const buyerCreditTransactionFactory = await this.transactionFactory.create(buyerCreditTransactionPayload)
            await this.data.transactions.create(buyerCreditTransactionFactory, session)

            await this.discord.inHouseNotification({
              title: `Quick Trade:- ${env.env} environment`,
              message: `
              
              Quick Trade of type ${matchingTrade.type} and ID ${matchingTrade._id} has been matched and filled completely by ${fullName}
              
              Trading Pair:- ${matchingTrade.pair}
              
              Amount:- ${matchingTrade.amount}

              Unit Price:- ${matchingTrade.unitPrice}

              Price:- ${matchingTrade.price}

              Creator/Seller ID :- ${seller.firstName} ${seller.lastName}:- ${seller._id}

              Buyer:- ${fullName}

              Remaining Amount To Buy:- ${remainingAmount}${buy}
      `,
              link: env.isProd ? QUICK_TRADE_CHANNEL_LINK_PRODUCTION : QUICK_TRADE_CHANNEL_LINK_DEVELOPMENT,
            })


            // create buy ad for the remaining amount
            const [quickTradeFactory, transactionFactory] = await Promise.all([
              this.quickTradeFactory.create({
                sellerId: userId,
                type: QuickTradeType.SELL,
                pair,
                unitPrice,
                price: _.multiply(remainingAmount, unitPrice),
                amount: remainingAmount,
              }),
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
            return
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
      await databaseHelper.executeTransactionWithStartTransaction(
        atomicTransaction,
        this.connection
      )

      return {
        message: `Buy ads added successfully`,
        data: {},
        status: HttpStatus.OK,
        state: ResponseState.SUCCESS,

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

  async sell(payload: IQuickTradeSell): Promise<ResponsesType<QuickTrade>> {

    try {

      const { userId, sell, acceptingCoin, unitPrice, amount, fullName } = payload
      const price = unitPrice * amount
      const pair = `${sell}/${acceptingCoin}`

      let data = {}
      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {

          const [creditWallet, debitWallet] = await Promise.all([
            this.data.wallets.findOne({ userId, coin: acceptingCoin, isBlocked: false }),
            this.data.wallets.findOne({ userId, coin: sell, balance: { $gte: amount } }),
          ])

          if (!creditWallet) return Promise.reject({
            status: HttpStatus.BAD_REQUEST,
            state: ResponseState.ERROR,
            message: `${acceptingCoin} wallet does not exists`,
            error: null,
          });
          if (!debitWallet) return Promise.reject({
            status: HttpStatus.BAD_REQUEST,
            state: ResponseState.ERROR,
            message: `Insufficient Balance`,
            error: null,
          });


          const matchingTrade: mongoose.HydratedDocument<QuickTrade> = await this.data.quickTrades.findOne({ type: QuickTradeType.BUY, unitPrice, pair, amount: { $lte: amount }, status: { $ne: QuickTradeStatus.FILLED } })
          const matchingTradeContract: mongoose.HydratedDocument<QuickTradeContract> = await this.data.quickTradeContracts.findOne({ quickTradeId: String(matchingTrade._id) }) // credit the user acceptingCoin wallet with the price

          const generalTransactionReference = generateReference('general')
          const debitedWallet = await this.data.wallets.update({ _id: debitWallet._id },
            {
              $inc: {
                balance: -amount,
              },
              lastWithdrawal: amount
            },
            session
          );


          const quickTradePayload = {
            sellerId: userId,
            type: QuickTradeType.SELL,
            pair,
            unitPrice,
            price,
            amount
          }
          const debitTransactionPayload = {
            userId,
            walletId: String(debitWallet?._id),
            currency: sell,
            amount: amount,
            signedAmount: -amount,
            type: TRANSACTION_TYPE.DEBIT,
            description: `Created a sell ad of ${amount}${sell}`,
            status: TRANSACTION_STATUS.PENDING,
            balanceAfter: debitedWallet?.balance,
            balanceBefore: debitWallet?.balance,
            subType: TRANSACTION_SUBTYPE.DEBIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.QUICK_TRADE,
            rate: {
              pair,
              rate: unitPrice
            },
            generalTransactionReference,
            reference: generateReference('debit'),
          }

          if (matchingTrade) {

            const buyer = matchingTrade.buyerId as unknown as mongoose.HydratedDocument<User>
            const buyerWallet = await this.data.wallets.findOne({ coin: sell, userId: String(buyer._id) })
            if (!buyerWallet) return Promise.reject({
              status: HttpStatus.BAD_REQUEST,
              state: ResponseState.ERROR,
              message: `Buyer wallet does not exists`,
              error: null,
            });

            const buyerPendingTransaction = await this.data.transactions.findOne({ generalTransactionReference: matchingTradeContract.generalTransactionReference })
            if (!buyerPendingTransaction) return Promise.reject({
              status: HttpStatus.BAD_REQUEST,
              state: ResponseState.ERROR,
              message: `Group Transaction Reference of ${matchingTradeContract.generalTransactionReference} does not exists`,
              error: null,
            });

            const buyerNotificationPayload = {
              message: `Your buy ad of ${matchingTrade.amount}${matchingTrade.pair} has been matched and filled`,
              title: `Credit Alert:- Quick Trade`,
              userId
            }
            const buyerNotificationFactory = await this.notificationFactory.create(buyerNotificationPayload)

            const [, , buyerCreditedWallet, ,] = await Promise.all([
              this.data.quickTradeContracts.update({ quickTradeId: String(matchingTrade._id) }, { status: QuickTradeContractStatus.COMPLETED }, session), // update contract
              this.data.quickTrades.update({ _id: matchingTrade._id }, {
                status: QuickTradeStatus.FILLED,
                filledDate: new Date(),
                sellerId: String(userId)
              }, session),
              this.data.wallets.update({ _id: buyerWallet._id }, {
                $inc: {
                  balance: amount,
                },
                lastDeposit: amount
              }, session),
              this.data.notifications.create(buyerNotificationFactory, session),
              this.data.transactions.update({ _id: buyerPendingTransaction._id }, { status: TRANSACTION_STATUS.COMPLETED }, session)
            ])
            const buyerCreditTransactionPayload = {
              userId: String(buyer._id),
              walletId: String(buyerWallet?._id),
              currency: buyerWallet.coin,
              amount: amount,
              signedAmount: amount,
              type: TRANSACTION_TYPE.CREDIT,
              description: `Your buy ad of ${matchingTrade.amount}${matchingTrade.pair} has been matched and filled`,
              status: TRANSACTION_STATUS.COMPLETED,
              balanceAfter: buyerCreditedWallet?.balance,
              balanceBefore: buyerWallet?.balance,
              subType: TRANSACTION_SUBTYPE.CREDIT,
              customTransactionType: CUSTOM_TRANSACTION_TYPE.QUICK_TRADE,
              rate: {
                pair,
                rate: unitPrice
              },
              generalTransactionReference: matchingTradeContract.generalTransactionReference,
              reference: generateReference('credit'),
            }

            const buyerCreditTransactionFactory = await this.transactionFactory.create(buyerCreditTransactionPayload)
            this.data.transactions.create(buyerCreditTransactionFactory, session)

            if (matchingTrade.amount === amount) {

              const sellerNotificationPayload = {
                message: `Your sell ad of ${amount}${sell} has been matched and filled`,
                title: `Credit Alert:- Quick Trade`,
                userId
              }
              const sellerNotificationFactory = await this.notificationFactory.create(sellerNotificationPayload)

              const [sellerCreditedWallet,] = await Promise.all([
                this.data.wallets.update({ _id: creditWallet._id }, {
                  $inc: {
                    balance: matchingTradeContract.price,
                  },
                  lastDeposit: matchingTradeContract.price
                }, session),
                this.data.notifications.create(sellerNotificationFactory, session),
              ])
              const sellerCreditTransactionPayload = {
                userId,
                walletId: String(creditWallet?._id),
                currency: creditWallet?.coin,
                amount: matchingTradeContract.price,
                signedAmount: matchingTradeContract.price,
                type: TRANSACTION_TYPE.CREDIT,
                description: `Your sell ad of ${amount}${sell} has been matched and filled`,
                status: TRANSACTION_STATUS.COMPLETED,
                balanceAfter: sellerCreditedWallet?.balance,
                balanceBefore: creditWallet?.balance,
                subType: TRANSACTION_SUBTYPE.CREDIT,
                customTransactionType: CUSTOM_TRANSACTION_TYPE.QUICK_TRADE,
                rate: {
                  pair,
                  rate: unitPrice
                },
                generalTransactionReference,
                reference: generateReference('credit'),
              }

              const sellerCreditTransactionFactory = await this.transactionFactory.create(sellerCreditTransactionPayload)
              await this.data.transactions.create(sellerCreditTransactionFactory, session)


              return
            }

            const sellerNotificationPayload = {
              message: `Your sell ad of ${amount}${sell} has been matched and partially filled`,
              title: `Credit Alert:- Quick Trade`,
              userId
            }
            const sellerNotificationFactory = await this.notificationFactory.create(sellerNotificationPayload)

            const remainingAmount = Math.abs(_.subtract(amount, matchingTrade.amount))
            const priceToPaySeller = _.multiply(matchingTrade.amount, unitPrice)

            const [sellerCreditedWallet, ,] = await Promise.all([
              this.data.wallets.update({ _id: creditWallet._id }, {
                $inc: {
                  balance: priceToPaySeller,
                },
                lastDeposit: priceToPaySeller
              }, session),

              this.data.notifications.create(sellerNotificationFactory, session),
            ])


            const sellerCreditTransactionPayload = {
              userId,
              walletId: String(creditWallet?._id),
              currency: creditWallet?.coin,
              amount: priceToPaySeller,
              signedAmount: priceToPaySeller,
              type: TRANSACTION_TYPE.CREDIT,
              description: `Your sell ad of ${amount}${sell} has been matched and partially filled`,
              status: TRANSACTION_STATUS.COMPLETED,
              balanceAfter: sellerCreditedWallet?.balance,
              balanceBefore: creditWallet?.balance,
              subType: TRANSACTION_SUBTYPE.CREDIT,
              customTransactionType: CUSTOM_TRANSACTION_TYPE.QUICK_TRADE,
              rate: {
                pair,
                rate: unitPrice
              },
              generalTransactionReference,
              reference: generateReference('credit'),
            }
            const sellerCreditTransactionFactory = await this.transactionFactory.create(sellerCreditTransactionPayload)
            await this.data.transactions.create(sellerCreditTransactionFactory, session)

            await this.discord.inHouseNotification({
              title: `Quick Trade:- ${env.env} environment`,
              message: `
              
              Quick Trade of type ${matchingTrade.type} and ID ${matchingTrade._id} has been matched and filled completely by ${fullName}
              
              Trading Pair:- ${matchingTrade.pair}
              
              Amount:- ${matchingTrade.amount}

              Unit Price:- ${matchingTrade.unitPrice}

              Price:- ${matchingTrade.price}

              Creator/Buyer ID :- ${buyer.firstName} ${buyer.lastName}:- ${buyer._id}

              Seller:- ${fullName}

              Remaining Amount To Sell:- ${remainingAmount}${sell}
      `,
              link: env.isProd ? QUICK_TRADE_CHANNEL_LINK_PRODUCTION : QUICK_TRADE_CHANNEL_LINK_DEVELOPMENT,
            })

            // create sell ad for the remaining amount
            const [quickTradeFactory, transactionFactory] = await Promise.all([
              this.quickTradeFactory.create({
                sellerId: userId,
                type: QuickTradeType.SELL,
                pair,
                unitPrice,
                price: _.multiply(remainingAmount, unitPrice),
                amount: remainingAmount
              }),
              this.transactionFactory.create(debitTransactionPayload)
            ])
            const quickTrade = await this.data.quickTrades.create(quickTradeFactory, session)


            const quickTradeContractPayload = {
              quickTradeId: String(quickTrade._id),
              price,
              status: QuickTradeContractStatus.PENDING,
              generalTransactionReference,

            }
            const quickTradeContractFactory = await this.quickTradeContractFactory.create(quickTradeContractPayload)
            const [quickTradeContract,] = await Promise.all([
              this.data.quickTradeContracts.create(quickTradeContractFactory, session),
              this.data.transactions.create(transactionFactory, session)
            ])
            data = { quickTrade, quickTradeContract }
            return


          }

          const [quickTradeFactory, transactionFactory] = await Promise.all([
            this.quickTradeFactory.create(quickTradePayload),
            this.transactionFactory.create(debitTransactionPayload)
          ])
          const quickTrade = await this.data.quickTrades.create(quickTradeFactory, session)


          const quickTradeContractPayload = {
            quickTradeId: String(quickTrade._id),
            amount,
            status: QuickTradeContractStatus.PENDING,
            generalTransactionReference,

          }
          const quickTradeContractFactory = await this.quickTradeContractFactory.create(quickTradeContractPayload)
          const [quickTradeContract,] = await Promise.all([
            this.data.quickTradeContracts.create(quickTradeContractFactory, session),
            this.data.transactions.create(transactionFactory, session)
          ])
          data = { quickTrade, quickTradeContract }
          return
        } catch (error) {
          Logger.error(error);
          return Promise.reject(error);
        }
      }

      await databaseHelper.executeTransactionWithStartTransaction(
        atomicTransaction,
        this.connection
      )




      // const atomicTransaction = async (session: mongoose.ClientSession) => {
      //   try {
      //     const price = unitPrice * amount

      //     const [creditWallet, debitWallet] = await Promise.all([
      //       this.data.wallets.findOne({ userId, coin: acceptingCoin, isBlocked: false }, session),
      //       this.data.wallets.findOne({ userId, coin: sell, balance: { $gte: amount } }, session),
      //     ])
      //     if (!creditWallet) throw new BadRequestsException("Wallet does not exists")
      //     if (!debitWallet) throw new BadRequestsException("Insufficient Balance")

      //     const debitedWallet = await this.data.wallets.update({ _id: creditWallet._id },
      //       {
      //         $inc: {
      //           balance: price,
      //         },
      //       },
      //       session
      //     );

      //     const generalTransactionReference = generateReference('general')
      //     const pair = `${sell}/${acceptingCoin}`

      //     const txCreditPayload = {
      //       userId,
      //       walletId: debitWallet?._id,
      //       currency: sell,
      //       amount: price,
      //       signedAmount: price,
      //       type: TRANSACTION_TYPE.DEBIT,
      //       description: `Created a sell ad of ${amount}${sell}`,
      //       status: TRANSACTION_STATUS.PENDING,
      //       balanceAfter: debitedWallet?.balance,
      //       balanceBefore: debitWallet?.balance,
      //       subType: TRANSACTION_SUBTYPE.DEBIT,
      //       customTransactionType: CUSTOM_TRANSACTION_TYPE.QUICK_TRADE,
      //       rate: {
      //         pair,
      //         rate: price
      //       },
      //       generalTransactionReference,
      //       reference: generateReference('debit'),
      //     };
      //     const quickTradePayload = {
      //       buyerId: userId,
      //       type: QuickTradeType.SELL,
      //       pair,
      //       price,
      //       amount
      //     }
      //     // const matchingQuickTrade = await this.data.quickTrades.findOne({ pair, price, type: QuickTradeType.BUY, amount: { $lte: amount } }, session)
      //     // if (matchingQuickTrade) {
      //     //   // get matching quick trade contract
      //     //   const matchingQuickTradeContract = await this.data.quickTradeContracts.findOne({ quickTradeId: matchingQuickTrade._id, status: QuickTradeContractStatus.PENDING }, session)
      //     //   if (matchingQuickTradeContract.amount < amount) {
      //     //     // fill trade
      //     //     await Promise.all([
      //     //       this.data.transactions.update({ generalTransactionReference: matchingQuickTradeContract.generalTransactionReference }, {
      //     //         status: TRANSACTION_STATUS.COMPLETED
      //     //       }, session),
      //     //       this.data.quickTrades.update({ _id: matchingQuickTrade._id }, { status: QuickTradeStatus.FILLED, filledDate: new Date() }, session),
      //     //       this.data.wallets.update({ id: creditWallet.id }, {
      //     //         $inc: {
      //     //           balance: price,
      //     //         },
      //     //         lastDeposit: price
      //     //       },
      //     //         session)
      //     //     ])
      //     //     Logger.log(`QUICK TRADE BUY AD OF ID ${matchingQuickTrade._id} filled`)
      //     //     return `QUICK TRADE BUY AD OF ID ${matchingQuickTrade._id} filled`
      //     //   }

      //     //   // get update transaction to successfull
      //     //   // fill or partial fill the trade
      //     //   // send notification
      //     // }
      //     const [quickTradeFactory, transactionFactory] = await Promise.all([
      //       this.quickTradeFactory.create(quickTradePayload),
      //       this.transactionFactory.create(txCreditPayload)
      //     ])
      //     const quickTrade = await this.data.quickTrades.create(quickTradeFactory, session)

      //     const quickTradeContractPayload = {
      //       quickTradeId: String(quickTrade._id),
      //       amount,
      //       status: QuickTradeContractStatus.PENDING,
      //       generalTransactionReference,

      //     }
      //     const quickTradeContractFactory = await this.quickTradeContractFactory.create(quickTradeContractPayload)

      //     await Promise.all([
      //       this.data.quickTradeContracts.create(quickTradeContractFactory, session),
      //       this.data.transactions.create(transactionFactory, session)
      //     ])
      //     return 'Quick Trade Sell Ad Created Successfully'
      //   } catch (error) {
      //     Logger.error(error);
      //     throw new Error(error);
      //   }
      // };
      // await databaseHelper.executeTransaction(
      //   atomicTransaction,
      //   this.connection
      // )
      return {
        message: `Sell ads added successfully`,
        data,
        status: HttpStatus.OK,
        state: ResponseState.SUCCESS,

      };
    } catch (error) {
      Logger.error(error);
      return Promise.reject({
        name: error.name,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "An error occured, please contact support",
        technical: error.message,
        state: 'error',
        error
      });
    }
  }

  async getBuyAds(payload: { perpage: string, page: string, dateFrom: string, dateTo: string, sortBy: string, orderBy: string, userId: string }): Promise<ResponsesType<QuickTrade>> {
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
        message: "Ads retrieved successfully",
        status: 200,
        data,
        pagination,
        state: ResponseState.SUCCESS,

      });

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

  async trade(payload: IQuickTradeBuyV2) {
    try {

      const { amount, cash, coin, method, userId, clientAccountName, clientAccountNumber, clientBankName, type } = payload
     
      const userManagement = await this.data.userFeatureManagement.findOne({ userId: new mongoose.Types.ObjectId(userId) })
      if (!userManagement) {
        return Promise.reject({
          status: HttpStatus.SERVICE_UNAVAILABLE,
          state: ResponseState.ERROR,
          message: `Service not available to you`,
          error: null
        })
      }
      if (type === 'buy' && !userManagement.canBuy) {
        return Promise.reject({
          status: HttpStatus.SERVICE_UNAVAILABLE,
          state: ResponseState.ERROR,
          message: `Feature not available to you`,
          error: null
        })
      }

      if (type === 'sell' && !userManagement.canSell) {
        return Promise.reject({
          status: HttpStatus.SERVICE_UNAVAILABLE,
          state: ResponseState.ERROR,
          message: `Feature not available to you`,
          error: null
        })
      }

      const ad = await this.data.p2pAds.findOne({
        type: type === 'buy' ? 'sell' : 'buy',
        cash,
        coin,
        status: { $ne: Status.FILLED },
        minLimit: { $lte: amount },
        totalAmount: { $gte: amount },
        // amount
        maxLimit: { $gt: amount },
        isPublished: true,
        isSwitchaMerchant: true
      })
      if (!ad) {
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: `No current ad match for ${amount}${coin}`,
          error: null
        })
      }
      const merchant = await this.data.users.findOne({ _id: ad.userId, lock: false })  // add creator
      if (!merchant || merchant.lock) {
        return Promise.reject({
          status: HttpStatus.BAD_REQUEST,
          state: ResponseState.ERROR,
          message: 'Something wrong with Merchant account, please do not continue with this merchant',
          error: null
        })
      }

      let order, clientWallet

      if (ad.type === P2pAdsType.BUY) {
        // check if seller has wallet and enough coin
        clientWallet = await this.data.wallets.findOne({ userId, coin: ad.coin })
        if (!clientWallet) {
          return Promise.reject({
            status: HttpStatus.BAD_REQUEST,
            state: ResponseState.ERROR,
            message: `Please create a ${ad.coin.toUpperCase()} wallet before interacting with trade`,
            error: null
          })
        }
        if (ad.minLimit >= clientWallet.balance) {
          return Promise.reject({
            status: HttpStatus.BAD_REQUEST,
            state: ResponseState.ERROR,
            message: `Insufficient balance in your ${ad.coin.toUpperCase()} balance to sell`,
            error: null
          })
        }
      }

      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {

          const orderPayload = {
            merchantId: String(merchant._id),
            clientId: userId,
            adId: String(ad._id),
            type: P2pOrderType.BUY,
            quantity: amount,
            // bankId,
            status: Status.PENDING,
            clientAccountName,
            clientAccountNumber,
            clientBankName,
            method,
            price: ad.price,
            clientWalletId: clientWallet ? String(clientWallet._id) : null,
            totalAmount: Math.abs(Number(ad.price)) * Math.abs(Number(amount))
          }

          const factory = await this.orderFactory.create(orderPayload)
          order = await this.data.p2pOrders.create(factory, session)

          await this.data.p2pAds.update({ _id: ad._id }, {
            $inc: {
              totalAmount: -amount
            }
          }, session) // deduct quantity from ad
          if (ad.type === P2pAdsType.BUY) {
            // check if seller has wallet and enough coin
            await this.data.wallets.update(
              { userId, coin: ad.coin }, {
              $inc: {
                balance: -amount,
                lockedBalance: amount
              }
            }, session)

          }



        }
        catch (error) {
          Logger.error(error);
          return Promise.reject(error)
        }
      }

      // try{}
      await databaseHelper.executeTransactionWithStartTransaction(
        atomicTransaction,
        this.connection
      )
      // create queue
      const activity: IActivity = {
        userId,
        action: type === P2pOrderType.SELL ? ActivityAction.QUICK_TRADE_SELL : ActivityAction.QUICK_TRADE_BUY,
        description: `Created P2P ${type} Order`
      }
      const notification: INotification = {
        userId: String(merchant._id),
        title: `Order created`,
        message: `Order created successfully for your ad, order id ${order.orderId}`
      }
      await this.utilsService.storeActivitySendNotification({ activity, notification })

      await this.orderQueue.add({ id: order._id }, {
        delay: Math.abs(Number(ad.paymentTimeLimit)) * 60000
      })



      return Promise.resolve({
        message: "Order created succesfully",
        status: HttpStatus.OK,
        data: {
          order,
          ad,
          timeInMin: Math.abs(Number(ad.paymentTimeLimit)),
          timeInMiliSeconds: Math.abs(Number(ad.paymentTimeLimit)) * 60000,
          timeInSeconds: Math.abs(Number(ad.paymentTimeLimit)) * 60
        },
      })
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'QUICK TRADE BUY CRYPTO',
        error,
        email: payload.email,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async sellV2(payload: IQuickTradeBuyV2) {
    try {
      const { amount, cash, coin, method } = payload
      const ads = await this.data.p2pAds.find({ type: 'buy' })

      return {
        message: `Bought ${amount} ${coin}`,
        data: {
          amount,
          cash,
          coin,
          method,
          ads
        },
        status: 200,
        state: ResponseState.SUCCESS,
      };
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'QUICK TRADE SELL CRYPTO',
        error,
        email: payload.email,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }
}


// QUICK_TRADE_CHANNEL_LINK_DEVELOPMENT
// QUICK_TRADE_CHANNEL_LINK_PRODUCTION

// {
//   _id: new ObjectId("62e1b156627ad6ec2a088bb5"),
//   roles: [],
//   userType: 'client',
//   authStatus: 'completed',
//   lock: 'unlock',
//   updatedAt: 2022-07-27T21:42:46.207Z,
//   createdAt: 2022-07-27T21:42:46.207Z,
//   lastLoginDate: 2022-07-28T15:00:09.298Z,
//   phoneVerified: false,
//   emailVerified: true,
//   agreedToTerms: true,
//   password: '$2b$10$SS2JnHZphDAnsGytGuEkle4DDLV2u4xvu66E8E1X65r9xqCPoxCva',
//   device: 'web',
//   email: 'gootech442@yahoo.com',
//   lastName: 'Yahoo',
//   firstName: 'Goodness',
//   __v: 0
// }