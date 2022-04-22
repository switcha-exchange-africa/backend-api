import { IDataServices } from "src/core/abstracts";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { FaucetFactoryServices } from "./faucet-factory.services";
import databaseHelper from "src/frameworks/data-services/mongo/database-helper";
import * as mongoose from "mongoose";
import { InjectConnection } from "@nestjs/mongoose";
import { TransactionReference } from "src/core/entities/transaction-reference.entity";
import { TransactionFactoryService } from "../transaction/transaction-factory.services";
import { Transaction } from "src/core/entities/transaction.entity";
import {
  CoinType,
  CUSTOM_TRANSACTION_TYPE,
  TRANSACTION_STATUS,
  TRANSACTION_SUBTYPE,
  TRANSACTION_TYPE,
} from "src/lib/constants";
import { TransactionReferenceFactoryService } from "../transaction/transaction-reference.services";
import { Faucet } from "src/core/entities/faucet.entity";
import { ResponsesType } from "src/core/types/response";
import { DoesNotExistsException } from "../user/exceptions";

@Injectable()
export class FaucetServices {
  constructor(
    private data: IDataServices,
    private faucetFactoryServices: FaucetFactoryServices,
    private txFactoryServices: TransactionFactoryService,
    private txRefFactoryServices: TransactionReferenceFactoryService,

    @InjectConnection() private readonly connection: mongoose.Connection
  ) { }

  async create(body: {
    amount: number;
    description: string;
    coin: string;
    userId: string;
  }): Promise<ResponsesType<Faucet>> {
    try {
      // atomic transaction
      const { amount, description, coin, userId } = body;
      let faucet: any;
      const processAtomicAction = async (session: mongoose.ClientSession) => {
        try {
          const faucetFactory = await this.faucetFactoryServices.create(body);
          faucet = await this.data.faucets.create(faucetFactory, session);

          const txRefPayload: TransactionReference = { userId, amount };
          const txRefFactory = await this.txRefFactoryServices.create(
            txRefPayload
          );
          const txRef = await this.data.transactionReferences.create(
            txRefFactory,
            session
          );

          const txPayload: Transaction = {
            userId,
            walletId: "faucet",
            txRefId: txRef?._id,
            currency: coin as CoinType,
            amount,
            signedAmount: amount,
            type: TRANSACTION_TYPE.CREDIT,
            description,
            status: TRANSACTION_STATUS.COMPLETED,
            balanceAfter: faucet?.balance,
            balanceBefore: faucet?.balance,
            hash: txRef.hash,
            subType: TRANSACTION_SUBTYPE.CREDIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.FAUCET,
          };

          const txFactory = await this.txFactoryServices.create(txPayload);
          await this.data.transactions.create(txFactory, session);
        } catch (e) {
          throw new HttpException(e.message, 500);
        }
      };

      await databaseHelper.executeTransaction(
        processAtomicAction,
        this.connection
      );
      return {
        message: "Faucet created successfully",
        data: faucet,
        status: HttpStatus.CREATED,
      };
    } catch (error) {
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw error;
    }
  }

  async fund(body: {
    amount: number;
    walletId: string;
    coin: string;
    userId: string;
  }): Promise<ResponsesType<any>> {
    const { amount, walletId, coin, userId } = body;

    try {
      const [faucet, wallet] = await Promise.all([
        this.data.faucets.findOne({ coin, balance: { $gte: amount } }),
        this.data.wallets.findOne({ _id: walletId, coin }),
      ]);

      if (!faucet || !wallet)
        throw new DoesNotExistsException("Wallet or Faucet does not exist");

      const processAtomicAction = async (
        session: mongoose.ClientSession
      ) => {
        try {
          const debitFaucet = await this.data.faucets.update(
            { _id: faucet._id },
            { $set: { lastWithdrawal: amount }, $inc: { balance: -amount } },
            session
          );

          const creditWallet = await this.data.wallets.update(
            { _id: walletId },
            { $set: { lastDeposit: amount }, $inc: { balance: amount } },
            session
          );

          const txRefPayload: TransactionReference = { userId, amount };
          const txRefFactory = await this.txRefFactoryServices.create(
            txRefPayload
          );
          const txRef = await this.data.transactionReferences.create(
            txRefFactory,
            session
          );

          const txDebitFaucetPayload: Transaction = {
            userId,
            walletId: "faucet",
            txRefId: txRef?._id,
            currency: coin as CoinType,
            amount,
            signedAmount: -amount,
            type: TRANSACTION_TYPE.DEBIT,
            description: "debited faucet",
            status: TRANSACTION_STATUS.COMPLETED,
            balanceAfter: debitFaucet?.balance,
            balanceBefore: faucet?.balance,
            hash: txRef.hash,
            subType: TRANSACTION_SUBTYPE.DEBIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.FAUCET,
          };

          const txWalletCreditPayload: Transaction = {
            userId,
            walletId,
            txRefId: txRef?._id,
            currency: coin as CoinType,
            amount,
            signedAmount: amount,
            type: TRANSACTION_TYPE.CREDIT,
            description: "credited wallet",
            status: TRANSACTION_STATUS.COMPLETED,
            balanceAfter: creditWallet?.balance,
            balanceBefore: wallet?.balance,
            hash: txRef.hash,
            subType: TRANSACTION_SUBTYPE.CREDIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.FAUCET,
          };

          const txDebitFaucetFactory = await this.txFactoryServices.create(
            txDebitFaucetPayload
          );
          const txCreditWalletFactory = await this.txFactoryServices.create(
            txWalletCreditPayload
          );
          await Promise.all([
            await this.data.transactions.create(txDebitFaucetFactory, session),
            await this.data.transactions.create(txCreditWalletFactory, session),
          ]);
        } catch (error) {
          throw new HttpException(error.message, 500);
        }
      };
      await databaseHelper.executeTransaction(
        processAtomicAction,
        this.connection
      );
      return {
        message: "Wallet funded successfully",
        data: {},
        status: HttpStatus.CREATED,
      };
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }

  async findAll(query: any): Promise<ResponsesType<Faucet>> {
    try {
      const { data, pagination } = await this.data.faucets.findAllWithPagination({
        query, queryFields: {}
      });
      return { status: 200, message: 'Faucets retrieved successfully', data, pagination }
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }

  async findOne(id: string): Promise<ResponsesType<Faucet>> {
    try {
      const data = await this.data.faucets.findOne({ _id: id });
      if (!data) throw new DoesNotExistsException('faucet does not exist')
      return { status: 200, message: 'Faucet retrieved successfully', data }
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }
}
