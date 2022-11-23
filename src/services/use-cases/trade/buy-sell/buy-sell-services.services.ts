import { InjectConnection } from "@nestjs/mongoose";
import databaseHelper from "src/frameworks/data-services/mongo/database-helper";
import { BuySellDto } from "src/core/dtos/trade/buy-sell.dto";
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { IDataServices, INotificationServices } from "src/core/abstracts";
import {
  BadRequestsException,
} from "../../user/exceptions";
import { env } from "src/configuration";
import * as mongoose from "mongoose";
import { CUSTOM_TRANSACTION_TYPE, Transaction, TRANSACTION_SUBTYPE, TRANSACTION_TYPE } from "src/core/entities/transaction.entity";
import { TransactionFactoryService } from "../../transaction/transaction-factory.services";
import { ResponseState, ResponsesType } from "src/core/types/response";
import { OptionalQuery } from "src/core/types/database";
import { generateReference } from "src/lib/utils";
import { BUY_SELL_CHANNEL_LINK_DEVELOPMENT, BUY_SELL_CHANNEL_LINK_PRODUCTION, ERROR_REPORTING_CHANNEL_LINK_DEVELOPMENT, ERROR_REPORTING_CHANNEL_LINK_PRODUCTION } from "src/lib/constants";
import { NotificationFactoryService } from "../../notification/notification-factory.service";
import { UtilsServices } from "../../utils/utils.service";
import { ActivityFactoryService } from "../../activity/activity-factory.service";
import { ActivityAction } from "src/core/dtos/activity";
import { IErrorReporter } from "src/core/types/error";
import { Status } from "src/core/types/status";

@Injectable()
export class BuySellServices {

  constructor(
    private dataServices: IDataServices,
    private txFactoryServices: TransactionFactoryService,
    private discord: INotificationServices,
    private notificationFactory: NotificationFactoryService,
    private readonly utils: UtilsServices,
    private readonly activityFactory: ActivityFactoryService,
    private readonly utilsService: UtilsServices,
    @InjectConnection('switcha') private readonly connection: mongoose.Connection
  ) { }

  async buy(body: BuySellDto, userId: string): Promise<ResponsesType<any>> {
    const { amount, debitCoin, creditCoin } = body;
    let email
    try {

      const [user, creditWallet, debitWallet, creditFeeWallet, debitFeeWallet] = await Promise.all([
        this.dataServices.users.findOne({ _id: userId }),
        this.dataServices.wallets.findOne({
          userId,
          coin: creditCoin,
        }),
        this.dataServices.wallets.findOne({
          userId,
          coin: debitCoin,
          balance: { $gt: 0 },
        }),
        this.dataServices.feeWallets.findOne({
          coin: creditCoin,
        }),
        this.dataServices.feeWallets.findOne({
          coin: debitCoin,
        })
      ]);


      if (!user) return Promise.reject({
        status: HttpStatus.NOT_FOUND,
        state: ResponseState.ERROR,
        message: 'User does not exist',
        error: null,
      });
      email = user.email
      if (!creditFeeWallet) {
        this.discord.inHouseNotification({
          title: `Error Reporter :- ${env.env} environment`,
          message: `

              Action: Buy Action

              User: ${user.email}

              ${creditCoin} fee wallet not set by admin
      `,
          link: env.isProd ? ERROR_REPORTING_CHANNEL_LINK_PRODUCTION : ERROR_REPORTING_CHANNEL_LINK_DEVELOPMENT,
        })
        return Promise.reject({
          status: HttpStatus.SERVICE_UNAVAILABLE,
          state: ResponseState.ERROR,
          message: `Feature under maintenance`,
          error: null,
        });
      }
      if (!debitFeeWallet) {
        this.discord.inHouseNotification({
          title: `Error Reporter :- ${env.env} environment`,
          message: `

              Action: Buy Action

              User: ${user.email}

              ${debitCoin} fee wallet not set by admin
      `,
          link: env.isProd ? ERROR_REPORTING_CHANNEL_LINK_PRODUCTION : ERROR_REPORTING_CHANNEL_LINK_DEVELOPMENT,
        })
        return Promise.reject({
          status: HttpStatus.SERVICE_UNAVAILABLE,
          state: ResponseState.ERROR,
          message: `Feature under maintenance`,
          error: null,
        });
      }
      if (!creditWallet) return Promise.reject({
        status: HttpStatus.NOT_FOUND,
        state: ResponseState.ERROR,
        message: `${creditCoin} wallet does not exist`,
        error: null,
      });

      if (!debitWallet) return Promise.reject({
        status: HttpStatus.NOT_FOUND,
        state: ResponseState.ERROR,
        message: `${debitCoin} wallet does not exist`,
        error: null,
      });


      const conversion = await this.utils.swap({ amount, source: debitCoin, destination: creditCoin })
      const { fee, deduction } = await this.utils.calculateFees({ operation: ActivityAction.BUY, amount: conversion.destinationAmount })

      const rate = conversion.rate
      const creditedAmount = deduction;

      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {
          const debitedWallet = await this.dataServices.wallets.update(
            {
              _id: debitWallet._id,
              balance: { $gte: amount },
            },
            {
              $inc: {
                balance: -amount,
              },
            },
            session
          );

          if (!debitedWallet) {
            Logger.error("Balance is 0");
            throw new Error("Insufficient Balance");
          }

          const creditedWallet = await this.dataServices.wallets.update(
            {
              _id: creditWallet._id,
            },
            {
              $inc: {
                balance: creditedAmount,
              },
            },
            session
          );
          if (!creditedWallet) {
            Logger.error("Error Occurred");
            throw new BadRequestsException("Error Occurred");
          }
          const creditedFeeWallet = await this.dataServices.feeWallets.update(
            {
              _id: creditFeeWallet._id,
            },
            {
              $inc: {
                balance: fee,
              },
              lastDeposit: fee
            },
            session
          );
          if (!creditedFeeWallet) {
            Logger.error("Error Occurred");
            throw new BadRequestsException("Error Occurred");
          }


          const generalTransactionReference = generateReference('general')

          const txCreditPayload: OptionalQuery<Transaction> = {
            userId,
            walletId: String(creditWallet?._id),
            currency: creditCoin,
            amount: creditedAmount,
            signedAmount: creditedAmount,
            type: TRANSACTION_TYPE.CREDIT,
            description: `Bought ${creditedAmount} ${creditCoin}`,
            status: Status.COMPLETED,
            balanceAfter: creditedWallet?.balance,
            balanceBefore: creditWallet?.balance || 0,
            subType: TRANSACTION_SUBTYPE.CREDIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.BUY,
            rate: {
              pair: `${creditCoin}${debitCoin}`,
              rate: rate
            },
            generalTransactionReference,
            reference: generateReference('credit'),

          };

          const txDebitPayload: OptionalQuery<Transaction> = {
            userId,
            walletId: String(debitWallet?._id),
            currency: debitCoin,
            amount: amount,
            signedAmount: -amount,
            type: TRANSACTION_TYPE.DEBIT,
            description: `Bought ${creditedAmount} ${creditCoin}`,
            status: Status.COMPLETED,
            balanceAfter: debitedWallet?.balance,
            balanceBefore: debitWallet?.balance || 0,
            subType: TRANSACTION_SUBTYPE.DEBIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.BUY,
            rate: {
              pair: `${creditCoin}${debitCoin}`,
              rate: rate
            },
            generalTransactionReference,
            reference: generateReference('debit'),
          };
          const txFeePayload: OptionalQuery<Transaction> = {
            userId,
            walletId: String(creditWallet?._id),
            currency: creditCoin,
            amount: fee,
            signedAmount: -fee,
            type: TRANSACTION_TYPE.DEBIT,
            description: `Charged ${fee} ${creditCoin}`,
            status: Status.COMPLETED,
            subType: TRANSACTION_SUBTYPE.FEE,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.BUY,
            rate: {
              pair: `${creditCoin}${debitCoin}`,
              rate: rate
            },
            generalTransactionReference,
            reference: generateReference('debit'),
          };
          const txFeeCreditPayload = {
            feeWalletId: String(creditFeeWallet?._id),
            currency: creditCoin,
            amount: fee,
            signedAmount: fee,
            type: TRANSACTION_TYPE.CREDIT,
            description: `Charged ${fee} ${creditCoin}`,
            status: Status.COMPLETED,
            subType: TRANSACTION_SUBTYPE.FEE,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.BUY,
            rate: {
              pair: `${creditCoin}${debitCoin}`,
              rate: rate
            },
            balanceBefore: creditFeeWallet.balance,
            balanceAfter: creditedFeeWallet.balance,
            generalTransactionReference,
            reference: generateReference('credit'),
          };


          const [txCreditFactory, txDebitFactory, notificationFactory, activityFactory, feeTransactionFactory, feeCreditTransactionFactory] = await Promise.all([
            this.txFactoryServices.create(txCreditPayload),
            this.txFactoryServices.create(txDebitPayload),
            this.notificationFactory.create({
              userId,
              title: "Bought Crypto",
              message: `Bought ${amount} ${debitCoin} of ${creditCoin}`
            }),
            this.activityFactory.create({
              action: ActivityAction.BUY,
              description: 'Bought crypto',
              userId
            }),
            this.txFactoryServices.create(txFeePayload),
            this.txFactoryServices.create(txFeeCreditPayload)

          ])
          await Promise.all([
            this.dataServices.transactions.create(txCreditFactory, session),
            this.dataServices.transactions.create(txDebitFactory, session),
            this.dataServices.notifications.create(notificationFactory, session),
            this.dataServices.activities.create(activityFactory, session),
            this.dataServices.transactions.create(feeTransactionFactory, session),
            this.dataServices.transactions.create(feeCreditTransactionFactory, session),

          ])

        } catch (error) {
          Logger.error(error);
          throw new Error(error);
        }
      };

      await Promise.all([
        databaseHelper.executeTransactionWithStartTransaction(
          atomicTransaction,
          this.connection
        ),
        this.discord.inHouseNotification({
          title: `Bought Crypto :- ${env.env} environment`,
          message: `

              Bought Crypto

              User: ${user.email}

              Fee: ${fee}

              Amount after deduction : ${deduction}

              Message: Bought ${amount} ${debitCoin} of ${creditCoin}

              ${creditedAmount} ${creditCoin} gotten

      `,
          link: env.isProd ? BUY_SELL_CHANNEL_LINK_PRODUCTION : BUY_SELL_CHANNEL_LINK_DEVELOPMENT,
        })
      ])

      return {
        message: `Bought ${creditedAmount} ${creditCoin}`,
        data: {
          rate,
          creditedAmount,
          fee
        },
        status: 200,
        state: ResponseState.SUCCESS,
      };

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'BUY CRYPTO',
        error,
        email,
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

  async sell(body: BuySellDto, userId: string): Promise<ResponsesType<any>> {
    const { amount, creditCoin, debitCoin } = body;
    let email
    try {


      const [user, debitWallet, creditWallet, debitFeeWallet, creditFeeWallet] = await Promise.all([
        this.dataServices.users.findOne({ _id: userId }),
        this.dataServices.wallets.findOne({
          userId,
          coin: debitCoin,
        }),
        this.dataServices.wallets.findOne({
          userId,
          coin: creditCoin,
        }),
        this.dataServices.feeWallets.findOne({
          coin: debitCoin,
        }),
        this.dataServices.feeWallets.findOne({
          coin: creditCoin,
        }),
      ]);
      if (!user) return Promise.reject({
        status: HttpStatus.NOT_FOUND,
        state: ResponseState.ERROR,
        message: "User does not exist",
        error: null,
      });
      email = user.email
      if (!creditWallet) return Promise.reject({
        status: HttpStatus.NOT_FOUND,
        state: ResponseState.ERROR,
        message: `${creditCoin} does not exists`,
        error: null,
      });

      if (!debitWallet) return Promise.reject({
        status: HttpStatus.NOT_FOUND,
        state: ResponseState.ERROR,
        message: `${debitCoin} does not exists`,
        error: null,
      });
      if (!creditFeeWallet) {
        this.discord.inHouseNotification({
          title: `Error Reporter :- ${env.env} environment`,
          message: `

              Action: SELL Action

              User: ${user.email}

              ${creditCoin} fee wallet not set by admin
      `,
          link: env.isProd ? ERROR_REPORTING_CHANNEL_LINK_PRODUCTION : ERROR_REPORTING_CHANNEL_LINK_DEVELOPMENT,
        })
        return Promise.reject({
          status: HttpStatus.SERVICE_UNAVAILABLE,
          state: ResponseState.ERROR,
          message: `Feature under maintenance`,
          error: null,
        });
      }
      if (!debitFeeWallet) {
        this.discord.inHouseNotification({
          title: `Error Reporter :- ${env.env} environment`,
          message: `

              Action: SELL Action

              User: ${user.email}

              ${debitCoin} fee wallet not set by admin
      `,
          link: env.isProd ? ERROR_REPORTING_CHANNEL_LINK_PRODUCTION : ERROR_REPORTING_CHANNEL_LINK_DEVELOPMENT,
        })
        return Promise.reject({
          status: HttpStatus.SERVICE_UNAVAILABLE,
          state: ResponseState.ERROR,
          message: `Feature under maintenance`,
          error: null,
        });
      }

      const { fee, deduction } = await this.utils.calculateFees({ operation: ActivityAction.BUY, amount })
      const conversion = await this.utils.swap({ amount: deduction, source: debitCoin, destination: creditCoin })

      const rate = conversion.rate
      const creditedAmount = conversion.destinationAmount

      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {
          const creditedWallet = await this.dataServices.wallets.update(
            {
              _id: creditWallet._id,
            },
            {
              $inc: {
                balance: creditedAmount,
              },
              lastDeposit: creditedAmount
            },
            session
          );

          if (!creditedWallet) {
            console.error("AN error Occured");

            throw new BadRequestsException("Error Occurred");
          }


          const creditedFeeWallet = await this.dataServices.feeWallets.update(
            {
              _id: debitFeeWallet._id,
            },
            {
              $inc: {
                balance: fee,
              },
              lastDeposit: fee
            },
            session
          );

          if (!creditedWallet) {
            console.error("AN error Occured");

            throw new BadRequestsException("Error Occurred");
          }

          const debitedWallet = await this.dataServices.wallets.update(
            {
              _id: debitWallet._id,
              balance: { $gt: 0, $gte: amount },
            },
            {
              $inc: {
                balance: -amount,
              },
              lastWithdrawal: amount
            },
            session
          );
          if (!debitedWallet) {
            console.error("AN error Occured");

            throw new BadRequestsException("Error Occurred");
          }
          const generalTransactionReference = generateReference('general')

          const txDebitedPayload: OptionalQuery<Transaction> = {
            userId,
            walletId: String(debitWallet?._id),
            currency: debitCoin,
            amount,
            reference: generateReference('debit'),
            signedAmount: -amount,
            type: TRANSACTION_TYPE.DEBIT,
            description: `Sold ${amount}${debitCoin}`,
            status: Status.COMPLETED,
            balanceAfter: debitedWallet?.balance,
            balanceBefore: debitWallet?.balance,
            subType: TRANSACTION_SUBTYPE.DEBIT,
            generalTransactionReference,
            rate: {
              pair: `${creditCoin}${debitCoin}`,
              rate: rate
            },
            customTransactionType: CUSTOM_TRANSACTION_TYPE.SELL,
          };
          const txCreditedPayload: OptionalQuery<Transaction> = {
            userId,
            walletId: String(creditWallet?._id),
            currency: creditCoin,
            amount: creditedAmount,
            signedAmount: creditedAmount,
            type: TRANSACTION_TYPE.CREDIT,
            description: `Sold ${amount}${debitCoin}`,
            status: Status.COMPLETED,
            balanceAfter: creditedWallet?.balance,
            balanceBefore: creditWallet?.balance,
            subType: TRANSACTION_SUBTYPE.CREDIT,
            generalTransactionReference,
            reference: generateReference('credit'),
            rate: {
              pair: `${creditCoin}${debitCoin}`,
              rate: rate
            },
            customTransactionType: CUSTOM_TRANSACTION_TYPE.SELL,
          };

          const txDebitFeePayload: OptionalQuery<Transaction> = {
            userId,
            walletId: String(debitWallet?._id),
            currency: debitCoin,
            amount: fee,
            reference: generateReference('debit'),
            signedAmount: -fee,
            type: TRANSACTION_TYPE.DEBIT,
            description: `Charged ${fee} ${debitCoin}`,
            status: Status.COMPLETED,
            subType: TRANSACTION_SUBTYPE.FEE,
            generalTransactionReference,
            rate: {
              pair: `${creditCoin}${debitCoin}`,
              rate: rate
            },
            customTransactionType: CUSTOM_TRANSACTION_TYPE.SELL,
          };

          const txFeeCreditPayload: OptionalQuery<Transaction> = {
            feeWalletId: creditedFeeWallet?._id,
            currency: debitCoin,
            amount: fee,
            signedAmount: fee,
            type: TRANSACTION_TYPE.CREDIT,
            description: `Charged ${fee} ${debitCoin}`,
            status: Status.COMPLETED,
            balanceAfter: creditedFeeWallet?.balance,
            balanceBefore: creditFeeWallet?.balance,
            subType: TRANSACTION_SUBTYPE.FEE,
            generalTransactionReference,
            reference: generateReference('credit'),
            rate: {
              pair: `${creditCoin}${debitCoin}`,
              rate: rate
            },
            customTransactionType: CUSTOM_TRANSACTION_TYPE.SELL,
          };

          const [txDebitFactory, txCreditFactory, notificationFactory, activityFactory, txFeeDebitFactory, txFeeCreditFactory] = await Promise.all([
            this.txFactoryServices.create(txDebitedPayload),
            this.txFactoryServices.create(txCreditedPayload),
            this.notificationFactory.create({
              userId,
              title: "Sold Crypto",
              message: `Sold ${amount} ${debitCoin} of ${creditCoin}`
            }),
            this.activityFactory.create({
              action: ActivityAction.SELL,
              description: 'Sold crypto',
              userId
            }),
            this.txFactoryServices.create(txDebitFeePayload),
            this.txFactoryServices.create(txFeeCreditPayload),

          ])
          await Promise.all([
            this.dataServices.transactions.create(txDebitFactory, session),
            this.dataServices.transactions.create(txCreditFactory, session),
            this.dataServices.notifications.create(notificationFactory, session),
            this.dataServices.activities.create(activityFactory, session),
            this.dataServices.transactions.create(txFeeDebitFactory, session),
            this.dataServices.transactions.create(txFeeCreditFactory, session),
          ])

        } catch (error) {
          console.error(error);
          throw new Error(error);
        }
      };

      await Promise.all([
        databaseHelper.executeTransactionWithStartTransaction(
          atomicTransaction,
          this.connection
        ),
        this.discord.inHouseNotification({
          title: `Sold Crypto :- ${env.env} environment`,
          message: `

              Sold Crypto

              User: ${user.email}

              Sold ${amount} ${debitCoin} to ${creditCoin}

              ${creditedAmount} ${creditCoin} gotten
      `,
          link: env.isProd ? BUY_SELL_CHANNEL_LINK_PRODUCTION : BUY_SELL_CHANNEL_LINK_DEVELOPMENT,
        })
      ])

      return {
        message: `Sold ${amount} ${debitCoin}`,
        data: {
          rate: conversion.rate,
          destinationAmount: creditedAmount
        },
        status: HttpStatus.OK,
        state: ResponseState.SUCCESS,

      };
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'SELL CRYPTO',
        error,
        email,
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
