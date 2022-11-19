import { TransactionFactoryService } from "src/services/use-cases/transaction/transaction-factory.services";
import { CUSTOM_TRANSACTION_TYPE, Transaction, TRANSACTION_SUBTYPE, TRANSACTION_TYPE } from "src/core/entities/transaction.entity";
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { IDataServices, INotificationServices } from "src/core/abstracts";
import { ICreateSwap, SwapDto } from "src/core/dtos/trade/swap.dto";
import { env, TATUM_API_KEY, TATUM_BASE_URL } from "src/configuration";
import { IHttpServices } from "src/core/abstracts/http-services.abstract";
import * as mongoose from "mongoose";
import databaseHelper from "src/frameworks/data-services/mongo/database-helper";
import { InjectConnection } from "@nestjs/mongoose";
import { ResponseState, ResponsesType } from "src/core/types/response";
import { generateReference } from "src/lib/utils";
import { OptionalQuery } from "src/core/types/database";
import { ERROR_REPORTING_CHANNEL_LINK_DEVELOPMENT, ERROR_REPORTING_CHANNEL_LINK_PRODUCTION, SWAP_CHANNEL_LINK_DEVELOPMENT, SWAP_CHANNEL_LINK_PRODUCTION } from "src/lib/constants";
import { UtilsServices } from "../../utils/utils.service";
import { ActivityAction } from "src/core/dtos/activity";
import { ActivityFactoryService } from "../../activity/activity-factory.service";
import { IErrorReporter } from "src/core/types/error";
import { IActivity } from "src/core/entities/Activity";
import { INotification } from "src/core/entities/notification.entity";
import { Status } from "src/core/types/status";

// const TATUM_CONFIG = {
//   headers: {
//     "X-API-Key": TATUM_API_KEY,
//   },
// };
@Injectable()
export class SwapServices {
  constructor(
    private data: IDataServices,
    private http: IHttpServices,
    private txFactoryServices: TransactionFactoryService,
    private discord: INotificationServices,
    private readonly utils: UtilsServices,
    private readonly activityFactory: ActivityFactoryService,
    private readonly utilsService: UtilsServices,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) { }

  private TATUM_CONFIG = {
    headers: {
      "X-API-Key": TATUM_API_KEY,
    },
  };

  async swap(body: SwapDto, userId: string): Promise<ResponsesType<any>> {
    let email
    try {
      const { amount, sourceCoin, destinationCoin } = body;
      const [user, sourceWallet, destinationWallet, destinationFeeWallet] = await Promise.all([
        this.data.users.findOne({ _id: userId }),
        this.data.wallets.findOne({
          userId,
          coin: sourceCoin,
        }),
        this.data.wallets.findOne({
          userId,
          coin: destinationCoin,
        }),
        this.data.feeWallets.findOne({
          coin: destinationCoin,
        }),
      ]);

      if (!user) {
        Logger.error("USER DOES NOT EXISTS")
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: `User does not exist`,
          error: null,
        })
      }
      email = user.email
      const userManagement = await this.data.userFeatureManagement.findOne({ userId: new mongoose.Types.ObjectId(userId) })
      if (!userManagement) {
        return Promise.reject({
          status: HttpStatus.SERVICE_UNAVAILABLE,
          state: ResponseState.ERROR,
          message: `Service not available to you`,
          error: null
        })
      }
      if (!userManagement.canSwap) {
        return Promise.reject({
          status: HttpStatus.SERVICE_UNAVAILABLE,
          state: ResponseState.ERROR,
          message: `Feature not available to you`,
          error: null
        })
      }

      if (!destinationFeeWallet) {
        this.discord.inHouseNotification({
          title: `Error Reporter :- ${env.env} environment`,
          message: `
  
              Action: Buy Action
  
              User: ${user.email}
  
              ${destinationCoin} fee wallet not set by admin
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
      if (!sourceWallet) {
        Logger.error("SOURCE WALLET DOES NOT EXISTS")
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: `${sourceCoin} wallet does not exists`,
          error: null,
        });
      }
      if (!destinationWallet) {
        Logger.error("DESTINATION WALLET DOES NOT EXISTS")
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: `${destinationCoin} wallet does not exists`,
          error: null,
        });
      }


      // const sourceRateUrl = `${TATUM_BASE_URL}/tatum/rate/${sourceCoin}?basePair=${CoinType.USD}`;
      // const destinationRateUrl = `${TATUM_BASE_URL}/tatum/rate/${destinationCoin}?basePair=${CoinType.USD}`;


      const { rate, destinationAmount } = await this.utils.swap({ amount, source: sourceCoin, destination: destinationCoin })
      const { fee, deduction } = await this.utils.calculateFees({ operation: ActivityAction.BUY, amount: destinationAmount })

      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {
          const creditDestinationWallet = await this.data.wallets.update(
            {
              _id: destinationWallet._id,
            },
            {
              $inc: {
                balance: deduction,
              },
              lastDeposit: deduction

            },
            session
          );

          if (!creditDestinationWallet) {
            Logger.error("Error Occurred");
            return Promise.reject({
              status: HttpStatus.BAD_REQUEST,
              state: ResponseState.ERROR,
              message: "Destination wallet does not match criteria",
              error: null,
            });
          }

          const debitSourceWallet = await this.data.wallets.update(
            {
              _id: sourceWallet.id,
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
          if (!debitSourceWallet) {
            Logger.error("Error Occurred");
            return Promise.reject({
              status: HttpStatus.BAD_REQUEST,
              state: ResponseState.ERROR,
              message: "Source wallet does not match criteria",
              error: null,
            });
          }
          const creditedFeeWallet = await this.data.feeWallets.update(
            {
              _id: destinationFeeWallet._id,
            },
            {
              $inc: {
                balance: fee,
              },
              lastDeposit: fee
            },
            session
          );
          const generalTransactionReference = generateReference('general')

          const txCreditPayload: OptionalQuery<Transaction> = {
            userId,
            walletId: String(destinationWallet?._id),
            currency: destinationCoin ,
            amount: destinationAmount,
            signedAmount: destinationAmount,
            type: TRANSACTION_TYPE.CREDIT,
            description: ` Swapped ${amount} ${sourceCoin} to ${destinationAmount} ${destinationCoin}`,
            status: Status.COMPLETED,
            balanceAfter: creditDestinationWallet?.balance,
            balanceBefore: destinationWallet?.balance,
            subType: TRANSACTION_SUBTYPE.CREDIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.SWAP,
            generalTransactionReference,
            reference: generateReference('credit'),
            rate: {
              pair: `${sourceCoin}${destinationCoin}`,
              rate: rate
            },
          };

          const txDebitPayload: OptionalQuery<Transaction> = {
            userId,
            walletId: String(sourceWallet?._id),
            currency: sourceCoin ,
            amount: amount,
            signedAmount: -amount,
            type: TRANSACTION_TYPE.DEBIT,
            description: ` Swapped ${amount} ${sourceCoin} to ${destinationAmount} ${destinationCoin}`,
            status: Status.COMPLETED,
            balanceAfter: debitSourceWallet?.balance,
            balanceBefore: sourceWallet?.balance,
            subType: TRANSACTION_SUBTYPE.DEBIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.SWAP,
            generalTransactionReference,
            reference: generateReference('debit'),
            rate: {
              pair: `${sourceCoin}${destinationCoin}`,
              rate: rate
            },
          };
          const txFeePayload: OptionalQuery<Transaction> = {
            userId,
            walletId: String(destinationWallet?._id),
            currency: destinationCoin ,
            amount: fee,
            signedAmount: -fee,
            type: TRANSACTION_TYPE.DEBIT,
            description: `Charged ${fee} ${destinationCoin}`,
            status: Status.COMPLETED,
            subType: TRANSACTION_SUBTYPE.FEE,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.BUY,
            rate: {
              pair: `${sourceCoin}${destinationCoin}`,
              rate: rate
            },
            generalTransactionReference,
            reference: generateReference('debit'),
          };

          const txFeeWalletPayload = {
            feeWalletId: String(destinationFeeWallet?._id),
            currency: destinationCoin ,
            amount: fee,
            signedAmount: fee,
            type: TRANSACTION_TYPE.CREDIT,
            description: `Charged ${fee} ${destinationCoin}`,
            status: Status.COMPLETED,
            subType: TRANSACTION_SUBTYPE.FEE,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.BUY,
            rate: {
              pair: `${sourceCoin}${destinationCoin}`,
              rate: rate
            },
            balanceBefore: destinationFeeWallet.balance,
            balanceAfter: creditedFeeWallet.balance,
            generalTransactionReference,
            reference: generateReference('credit'),
          };

          const [txCreditFactory, txDebitFactory, activityFactory, txFeeFactory, txFeeWalletFactory] = await Promise.all([
            this.txFactoryServices.create(txCreditPayload),
            this.txFactoryServices.create(txDebitPayload),
            this.activityFactory.create({
              action: ActivityAction.SWAP,
              description: 'Swapped crypto',
              userId
            }),
            this.txFactoryServices.create(txFeePayload),
            this.txFactoryServices.create(txFeeWalletPayload),

          ])

          await this.data.transactions.create(txCreditFactory, session)
          await this.data.transactions.create(txDebitFactory, session)
          await this.data.activities.create(activityFactory, session)
          await this.data.transactions.create(txFeeFactory, session)
          await this.data.transactions.create(txFeeWalletFactory, session)

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
          title: `Swap Coins :- ${env.env} environment`,
          message: `
  
              Swap Crypto
  
              User: ${user.email}
  
              Swapped ${amount} ${sourceCoin} to ${destinationCoin}
  
              ${destinationAmount} ${destinationCoin} gotten
  
      `,
          link: env.isProd ? SWAP_CHANNEL_LINK_PRODUCTION : SWAP_CHANNEL_LINK_DEVELOPMENT,
        })
      ])
      return {
        message: `Swap successful`,
        data: {
          rate,
          destinationAmount
        },
        status: 200,
        state: ResponseState.SUCCESS,
      };
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'SWAP CRYPTO',
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

  async swapV2(payload: ICreateSwap) {
    const { amount, sourceCoin, destinationCoin, email, userId } = payload;
    try {
      const [sourceWallet, destinationWallet, feeWallet] = await Promise.all([
        this.data.wallets.findOne({
          userId,
          coin: sourceCoin,
        }),
        this.data.wallets.findOne({
          userId,
          coin: destinationCoin,
        }),
        this.data.feeWallets.findOne({
          coin: destinationCoin,
        }),
      ]);

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
      if (!userManagement.canSwap) {
        return Promise.reject({
          status: HttpStatus.SERVICE_UNAVAILABLE,
          state: ResponseState.ERROR,
          message: `Feature not available to you`,
          error: null
        })
      }
      // checks for if any of the wallet exists
      if (!feeWallet) {
        this.discord.inHouseNotification({
          title: `Error Reporter :- ${env.env} environment`,
          message: `
  
              Action: Buy Action
  
              User: ${email}
  
              ${destinationCoin} fee wallet not set by admin
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
      if (!sourceWallet) {
        Logger.error("SOURCE WALLET DOES NOT EXISTS")
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: `${sourceCoin} wallet does not exists`,
          error: null,
        });
      }
      if (!destinationWallet) {
        Logger.error("DESTINATION WALLET DOES NOT EXISTS")
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: `${destinationCoin} wallet does not exists`,
          error: null,
        });
      }
      const sourceUrl = `${TATUM_BASE_URL}/tatum/rate/${sourceCoin}?basePair=USD`;
      const destinationUrl = `${TATUM_BASE_URL}/tatum/rate/${destinationCoin}?basePair=USD`;
      const { value: sourceRate } = await this.http.get(sourceUrl, this.TATUM_CONFIG)
      const { value: destinationRate } = await this.http.get(destinationUrl, this.TATUM_CONFIG)
      const { destinationAmount, rate } = await this.utilsService.swapV2({ sourceRate, destinationRate, amount })

      const { fee, deduction } = await this.utils.calculateFees({ operation: ActivityAction.BUY, amount: destinationAmount })

      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {
          const creditDestinationWallet = await this.data.wallets.update(
            {
              _id: destinationWallet._id,
            },
            {
              $inc: {
                balance: deduction,
              },
              lastDeposit: deduction

            },
            session
          );

          if (!creditDestinationWallet) {
            Logger.error("Error Occurred");
            return Promise.reject({
              status: HttpStatus.BAD_REQUEST,
              state: ResponseState.ERROR,
              message: "Destination wallet does not match criteria",
              error: null,
            });
          }

          const debitSourceWallet = await this.data.wallets.update(
            {
              _id: sourceWallet.id,
              balance: { $gte: amount },
            },
            {
              $inc: {
                balance: -amount,
              },
              lastWithdrawal: amount
            },
            session
          );
          if (!debitSourceWallet) {
            Logger.error("Error Occurred");
            return Promise.reject({
              status: HttpStatus.BAD_REQUEST,
              state: ResponseState.ERROR,
              message: "Source wallet does not match criteria",
              error: null,
            });
          }
          const creditedFeeWallet = await this.data.feeWallets.update(
            {
              _id: feeWallet._id,
            },
            {
              $inc: {
                balance: fee,
              },
              lastDeposit: fee
            },
            session
          );
          const generalTransactionReference = generateReference('general')

          const txCreditPayload: OptionalQuery<Transaction> = {
            userId,
            walletId: String(destinationWallet?._id),
            currency: destinationCoin ,
            amount: deduction,
            signedAmount: deduction,
            type: TRANSACTION_TYPE.CREDIT,
            description: ` Swapped ${amount} ${sourceCoin} to ${deduction} ${destinationCoin}`,
            status: Status.COMPLETED,
            balanceAfter: creditDestinationWallet?.balance,
            balanceBefore: destinationWallet?.balance,
            subType: TRANSACTION_SUBTYPE.CREDIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.SWAP,
            generalTransactionReference,
            reference: generateReference('credit'),
            rate: {
              pair: `${sourceCoin}${destinationCoin}`,
              rate: rate
            },
          };

          const txDebitPayload: OptionalQuery<Transaction> = {
            userId,
            walletId: String(sourceWallet?._id),
            currency: sourceCoin ,
            amount: amount,
            signedAmount: -amount,
            type: TRANSACTION_TYPE.DEBIT,
            description: ` Swapped ${amount} ${sourceCoin} to ${deduction} ${destinationCoin}`,
            status: Status.COMPLETED,
            balanceAfter: debitSourceWallet?.balance,
            balanceBefore: sourceWallet?.balance,
            subType: TRANSACTION_SUBTYPE.DEBIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.SWAP,
            generalTransactionReference,
            reference: generateReference('debit'),
            rate: {
              pair: `${sourceCoin}${destinationCoin}`,
              rate: rate
            },
          };
          const txFeePayload: OptionalQuery<Transaction> = {
            userId,
            walletId: String(destinationWallet?._id),
            currency: destinationCoin ,
            amount: fee,
            signedAmount: -fee,
            type: TRANSACTION_TYPE.DEBIT,
            description: `Charged ${fee} ${destinationCoin}`,
            status: Status.COMPLETED,
            subType: TRANSACTION_SUBTYPE.FEE,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.SWAP,
            rate: {
              pair: `${sourceCoin}${destinationCoin}`,
              rate: rate
            },
            generalTransactionReference,
            reference: generateReference('debit'),
          };

          const txFeeWalletPayload = {
            feeWalletId: String(feeWallet?._id),
            currency: destinationCoin ,
            amount: fee,
            signedAmount: fee,
            type: TRANSACTION_TYPE.CREDIT,
            description: `Charged ${fee} ${destinationCoin}`,
            status: Status.COMPLETED,
            subType: TRANSACTION_SUBTYPE.FEE,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.SWAP,
            rate: {
              pair: `${sourceCoin}${destinationCoin}`,
              rate: rate
            },
            balanceBefore: feeWallet.balance,
            balanceAfter: creditedFeeWallet.balance,
            generalTransactionReference,
            reference: generateReference('credit'),
          };

          const [txCreditFactory, txDebitFactory, activityFactory, txFeeFactory, txFeeWalletFactory] = await Promise.all([
            this.txFactoryServices.create(txCreditPayload),
            this.txFactoryServices.create(txDebitPayload),
            this.activityFactory.create({
              action: ActivityAction.SWAP,
              description: 'Swapped crypto',
              userId
            }),
            this.txFactoryServices.create(txFeePayload),
            this.txFactoryServices.create(txFeeWalletPayload),

          ])

          await this.data.transactions.create(txCreditFactory, session)
          await this.data.transactions.create(txDebitFactory, session)
          await this.data.activities.create(activityFactory, session)
          await this.data.transactions.create(txFeeFactory, session)
          await this.data.transactions.create(txFeeWalletFactory, session)

        } catch (error) {
          Logger.error(error);
          throw new Error(error);
        }
      };
      await databaseHelper.executeTransactionWithStartTransaction(
        atomicTransaction,
        this.connection
      )

      const activity: IActivity = {
        userId,
        action: ActivityAction.SWAP,
        description: ` Swapped ${amount} ${sourceCoin} to ${deduction} ${destinationCoin}`,
        amount,
        coin: sourceCoin
      }
      const notification: INotification = {
        userId,
        title: `Swap`,
        message: ` Swapped ${amount} ${sourceCoin} to ${deduction} ${destinationCoin}`
      }
      await this.utilsService.storeActivitySendNotification({ activity, notification })

      await Promise.all([

        this.discord.inHouseNotification({
          title: `Swap Coins :- ${env.env} environment`,
          message: `
  
              Swap Crypto
  
              User: ${email}
  
              Swapped ${amount} ${sourceCoin} to ${deduction} ${destinationCoin}
  
               Fee ${fee} ${destinationCoin}
  
      `,
          link: env.isProd ? SWAP_CHANNEL_LINK_PRODUCTION : SWAP_CHANNEL_LINK_DEVELOPMENT,
        })
      ])
      return {
        message: `Swap successful`,
        data: {
          amount,
          destinationAmount, rate
        },
        status: 200,
        state: ResponseState.SUCCESS,
      };
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'SWAP CRYPTO',
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
