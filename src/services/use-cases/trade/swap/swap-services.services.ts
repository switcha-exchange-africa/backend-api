import { TransactionFactoryService } from "src/services/use-cases/transaction/transaction-factory.services";
import { CUSTOM_TRANSACTION_TYPE, Transaction, TRANSACTION_STATUS, TRANSACTION_SUBTYPE, TRANSACTION_TYPE } from "src/core/entities/transaction.entity";
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { IDataServices, INotificationServices } from "src/core/abstracts";
import { SwapDto } from "src/core/dtos/trade/swap.dto";
import { env, TATUM_API_KEY, TATUM_BASE_URL } from "src/configuration";
import { IHttpServices } from "src/core/abstracts/http-services.abstract";

import * as mongoose from "mongoose";
import databaseHelper from "src/frameworks/data-services/mongo/database-helper";
import { InjectConnection } from "@nestjs/mongoose";
import { ResponseState, ResponsesType } from "src/core/types/response";
import { CoinType } from "src/core/entities/wallet.entity";
import { generateReference } from "src/lib/utils";
import { OptionalQuery } from "src/core/types/database";
import { SWAP_CHANNEL_LINK_DEVELOPMENT, SWAP_CHANNEL_LINK_PRODUCTION } from "src/lib/constants";

const TATUM_CONFIG = {
  headers: {
    "X-API-Key": TATUM_API_KEY,
  },
};
@Injectable()
export class SwapServices {
  constructor(
    private dataServices: IDataServices,
    private http: IHttpServices,
    private txFactoryServices: TransactionFactoryService,
    private discord: INotificationServices,
    @InjectConnection() private readonly connection: mongoose.Connection
  ) { }

  async swap(body: SwapDto, userId: string): Promise<ResponsesType<any>> {
    const { amount, sourceCoin, destinationCoin } = body;
    const [user, sourceWallet, destinationWallet] = await Promise.all([
      this.dataServices.users.findOne({ _id: userId }),
      this.dataServices.wallets.findOne({
        userId,
        coin: sourceCoin,
      }),
      this.dataServices.wallets.findOne({
        userId,
        coin: destinationCoin,
      }),
    ]);
    if (!user) return Promise.reject({
      status: HttpStatus.NOT_FOUND,
      state: ResponseState.ERROR,
      message: `User does not exist`,
      error: null,
    })
    if (!sourceWallet) return Promise.reject({
      status: HttpStatus.NOT_FOUND,
      state: ResponseState.ERROR,
      message: `${sourceWallet} does not exists`,
      error: null,
    });
    if (!destinationWallet) return Promise.reject({
      status: HttpStatus.NOT_FOUND,
      state: ResponseState.ERROR,
      message: `${destinationWallet} does not exists`,
      error: null,
    });


    const sourceRateUrl = `${TATUM_BASE_URL}/tatum/rate/${sourceCoin}?basePair=${CoinType.USD}`;
    const destinationRateUrl = `${TATUM_BASE_URL}/tatum/rate/${destinationCoin}?basePair=${CoinType.USD}`;


    const [{ value: sourceRate }, { value: destinationRate }] = await Promise.all([
      this.http.get(sourceRateUrl, TATUM_CONFIG),
      this.http.get(destinationRateUrl, TATUM_CONFIG),
    ]);

    const destinationAmount = parseFloat(((sourceRate / destinationRate) * amount).toFixed(4));

    const atomicTransaction = async (session: mongoose.ClientSession) => {
      try {
        const creditDestinationWallet = await this.dataServices.wallets.update(
          {
            _id: destinationWallet._id,
          },
          {
            $inc: {
              balance: destinationAmount,
            },
            lastDeposit: destinationAmount

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

        const debitSourceWallet = await this.dataServices.wallets.update(
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

        const generalTransactionReference = generateReference('general')

        const txCreditPayload: OptionalQuery<Transaction> = {
          userId,
          walletId: destinationWallet?._id,
          currency: destinationCoin as unknown as CoinType,
          amount: destinationAmount,
          signedAmount: destinationAmount,
          type: TRANSACTION_TYPE.CREDIT,
          description: "swap currency",
          status: TRANSACTION_STATUS.COMPLETED,
          balanceAfter: creditDestinationWallet?.balance,
          balanceBefore: destinationWallet?.balance,
          subType: TRANSACTION_SUBTYPE.CREDIT,
          customTransactionType: CUSTOM_TRANSACTION_TYPE.SWAP,
          generalTransactionReference,
          reference: generateReference('credit'),

        };

        const txDebitPayload: OptionalQuery<Transaction> = {
          userId,
          walletId: sourceWallet?._id,
          currency: sourceCoin as unknown as CoinType,
          amount: amount,
          signedAmount: -amount,
          type: TRANSACTION_TYPE.DEBIT,
          description: "swap currency",
          status: TRANSACTION_STATUS.COMPLETED,
          balanceAfter: debitSourceWallet?.balance,
          balanceBefore: sourceWallet?.balance,
          subType: TRANSACTION_SUBTYPE.DEBIT,
          customTransactionType: CUSTOM_TRANSACTION_TYPE.SWAP,
          generalTransactionReference,
          reference: generateReference('debit'),

        };

        const [txCreditFactory, txDebitFactory] = await Promise.all([
          this.txFactoryServices.create(txCreditPayload),
          this.txFactoryServices.create(txDebitPayload)
        ])

        await Promise.all([
          this.dataServices.transactions.create(txCreditFactory, session),
          this.dataServices.transactions.create(txDebitFactory, session)
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
        title: `Swap Coins :- ${env.env} environment`,
        message: `

        Swap Crypto

        User: ${user.email}

        Swapped ${amount} ${sourceCoin} to ${destinationCoin}
        
`,
        link: env.isProd ? SWAP_CHANNEL_LINK_PRODUCTION : SWAP_CHANNEL_LINK_DEVELOPMENT,
      })
    ])
    return {
      message: `Swap successful`,
      data: {},
      status: 200,
      state: ResponseState.SUCCESS,
    };
  }
}
