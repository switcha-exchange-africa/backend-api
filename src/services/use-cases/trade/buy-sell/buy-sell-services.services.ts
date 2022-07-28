import { TransactionReference } from "src/core/entities/transaction-reference.entity";
import { InjectConnection } from "@nestjs/mongoose";
import databaseHelper from "src/frameworks/data-services/mongo/database-helper";
import { BuySellDto } from "src/core/dtos/trade/buy-sell.dto";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { IHttpServices } from "src/core/abstracts/http-services.abstract";
import { IDataServices, INotificationServices } from "src/core/abstracts";
import {
  BadRequestsException,
  DoesNotExistsException,
} from "../../user/exceptions";
import { env, TATUM_API_KEY, TATUM_BASE_URL } from "src/configuration";
import * as mongoose from "mongoose";
import { CUSTOM_TRANSACTION_TYPE, Transaction, TRANSACTION_STATUS, TRANSACTION_SUBTYPE, TRANSACTION_TYPE } from "src/core/entities/transaction.entity";
import { TransactionFactoryService } from "../../transaction/transaction-factory.services";
import { ResponsesType } from "src/core/types/response";
import { OptionalQuery } from "src/core/types/database";
import { generateReference } from "src/lib/utils";
import { BUY_SELL_CHANNEL_LINK_DEVELOPMENT, BUY_SELL_CHANNEL_LINK_PRODUCTION } from "src/lib/constants";
import { NotificationFactoryService } from "../../notification/notification-factory.service";

@Injectable()
export class BuySellServices {
  private config = {
    headers: {
      "X-API-Key": TATUM_API_KEY,
    },
  };
  constructor(
    private http: IHttpServices,
    private dataServices: IDataServices,
    private txFactoryServices: TransactionFactoryService,
    private discord: INotificationServices,
    private notificationFactory: NotificationFactoryService,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) { }

  async buy(body: BuySellDto, userId: string): Promise<ResponsesType<any>> {
    const { amount, debitCoin, creditCoin } = body;
    try {
      const url = `${TATUM_BASE_URL}/tatum/rate/${creditCoin}?basePair=${debitCoin}`;
      const [user, creditWallet, debitWallet, { value }] = await Promise.all([
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
        this.http.get(url, this.config),
      ]);

      if (!user) throw new DoesNotExistsException("User does not exist");
      if (!creditWallet || !debitWallet)
        throw new DoesNotExistsException("Wallet does not exist");

      const rate = value
      const creditedAmount = parseFloat((amount / rate).toFixed(4));

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
            throw new BadRequestsException("Insufficient Balance");
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

          const txRefPayload: TransactionReference = { userId, amount };
          const txRef = await this.dataServices.transactionReferences.create(txRefPayload, session);
          const generalTransactionReference = generateReference('general')

          const txCreditPayload: OptionalQuery<Transaction> = {
            userId,
            walletId: String(creditWallet?._id),
            currency: creditCoin,
            amount: creditedAmount,
            signedAmount: creditedAmount,
            type: TRANSACTION_TYPE.CREDIT,
            description: `${creditCoin} bought`,
            status: TRANSACTION_STATUS.COMPLETED,
            balanceAfter: creditedWallet?.balance,
            balanceBefore: creditWallet?.balance,
            hash: txRef?.hash,
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
            walletId: debitWallet?._id,
            currency: debitCoin,
            amount: amount,
            signedAmount: -amount,
            type: TRANSACTION_TYPE.DEBIT,
            description: `${debitCoin} bought`,
            status: TRANSACTION_STATUS.COMPLETED,
            balanceAfter: debitedWallet?.balance,
            balanceBefore: debitWallet?.balance,
            hash: txRef?.hash,
            subType: TRANSACTION_SUBTYPE.DEBIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.BUY,
            rate: {
              pair: `${creditCoin}${debitCoin}`,
              rate: rate
            },
            generalTransactionReference,
            reference: generateReference('debit'),

          };

          const [txCreditFactory, txDebitFactory, notificationFactory] = await Promise.all([
            this.txFactoryServices.create(txCreditPayload),
            this.txFactoryServices.create(txDebitPayload),
            this.notificationFactory.create({
              userId,
              title: "Bought Crypto",
              message: `Bought ${amount} ${debitCoin} of ${creditCoin}`
            })
          ])
          await Promise.all([
            this.dataServices.transactions.create(txCreditFactory, session),
            this.dataServices.transactions.create(txDebitFactory, session),
            this.dataServices.notifications.create(notificationFactory, session)
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
          title: `Bought Crypto :- ${env.env} environment`,
          message: `
  
          Bought Crypto

          User: ${user.email}
  
          Bought ${amount} ${debitCoin} of ${creditCoin}
          
  `,
          link: env.isProd ? BUY_SELL_CHANNEL_LINK_PRODUCTION : BUY_SELL_CHANNEL_LINK_DEVELOPMENT,
        })
      ])

      return {
        message: `${creditCoin} bought successfully`,
        data: {},
        status: 200,
      };
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError") throw new HttpException(error.message, 500);
      throw error;
    }
  }

  async sell(body: BuySellDto, userId: string): Promise<ResponsesType<any>> {
    const { amount, creditCoin, debitCoin } = body;

    try {
      const [user, debitWallet, creditWallet] = await Promise.all([
        this.dataServices.users.findOne({ _id: userId }),
        this.dataServices.wallets.findOne({
          userId,
          coin: debitCoin,
        }),
        this.dataServices.wallets.findOne({
          userId,
          coin: creditCoin,
        }),
      ]);
      if (!user) throw new DoesNotExistsException("user does not exist");
      if (!creditWallet) throw new DoesNotExistsException(`${creditCoin} does not exists`);
      if (!debitWallet) throw new DoesNotExistsException(`${debitCoin} does not exists`);
      const url = `${TATUM_BASE_URL}/tatum/rate/${debitCoin}?basePair=${creditCoin}`;
      const { value } = await this.http.get(url, this.config);
      const rate = value
      const creditedAmount = parseFloat((rate * amount).toFixed(4));

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
            walletId: debitWallet?._id,
            currency: debitCoin,
            amount,
            reference: generateReference('debit'),
            signedAmount: -amount,
            type: TRANSACTION_TYPE.DEBIT,
            description: `${debitCoin} sold`,
            status: TRANSACTION_STATUS.COMPLETED,
            balanceAfter: debitedWallet?.balance,
            balanceBefore: debitWallet?.balance,
            subType: TRANSACTION_SUBTYPE.DEBIT,
            generalTransactionReference,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.SELL,
          };
          const txCreditedPayload: OptionalQuery<Transaction> = {
            userId,
            walletId: creditWallet?._id,
            currency: creditCoin,
            amount: creditedAmount,
            signedAmount: creditedAmount,
            type: TRANSACTION_TYPE.CREDIT,
            description: `${creditCoin} sold`,
            status: TRANSACTION_STATUS.COMPLETED,
            balanceAfter: creditedWallet?.balance,
            balanceBefore: creditWallet?.balance,
            subType: TRANSACTION_SUBTYPE.CREDIT,
            generalTransactionReference,
            reference: generateReference('credit'),
            customTransactionType: CUSTOM_TRANSACTION_TYPE.SELL,
          };

          const [txDebitFactory, txCreditFactory, notificationFactory] = await Promise.all([
            this.txFactoryServices.create(txDebitedPayload),
            this.txFactoryServices.create(txCreditedPayload),
            this.notificationFactory.create({
              userId,
              title: "Sold Crypto",
              message: `Sold ${amount} ${debitCoin} of ${creditCoin}`
            })
          ])
          await Promise.all([
            this.dataServices.transactions.create(txDebitFactory, session),
            this.dataServices.transactions.create(txCreditFactory, session),
            this.dataServices.notifications.create(notificationFactory, session)
          ])

        } catch (error) {
          console.error(error);
          throw new Error(error);
        }
      };

      await Promise.all([
        databaseHelper.executeTransaction(
          atomicTransaction,
          this.connection
        ),
        this.discord.inHouseNotification({
          title: `Sold Crypto :- ${env.env} environment`,
          message: `
  
          Sold Crypto

          User: ${user.email}
  
          Sold ${amount} ${debitCoin} of ${creditCoin}
          
  `,
          link: env.isProd ? BUY_SELL_CHANNEL_LINK_PRODUCTION : BUY_SELL_CHANNEL_LINK_DEVELOPMENT,
        })
      ])

      return {
        message: `${debitCoin} sold successfully`,
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
}
