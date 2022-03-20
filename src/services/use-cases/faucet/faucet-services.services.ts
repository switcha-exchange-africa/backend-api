import { IDataServices } from "src/core/abstracts";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import { FaucetFactoryServices } from "./faucet-factory.services";
import { FaucetDto } from "src/core/dtos/wallet/faucet.dto";
import databaseHelper from "src/frameworks/data-services/mongo/database-helper";
import * as mongoose from 'mongoose';
import { InjectConnection } from "@nestjs/mongoose";
import { TransactionReference } from "src/core/entities/transaction-reference.entity";
import { TransactionFactoryService } from "../transaction/transaction-factory.services";
import { Transaction } from "src/core/entities/transaction.entity";
import { CUSTOM_TRANSACTION_TYPE, TRANSACTION_STATUS, TRANSACTION_SUBTYPE, TRANSACTION_TYPE } from "src/lib/constants";
import { generateTXHash } from "src/lib/utils";

@Injectable()
export class FaucetServices {
  constructor(
    private data: IDataServices,
    private faucetFactoryServices: FaucetFactoryServices,
    private txFactoryServices: TransactionFactoryService,

    @InjectConnection() private readonly connection: mongoose.Connection,
  ) { }

  async create(body: FaucetDto) {
    try {
      // atomic transaction
      const { userId, amount, description, coin } = body
      let faucet: any
      const processAtomicAction = async (session: mongoose.ClientSession) => {
        try {
          const factory = await this.faucetFactoryServices.create(body);
          faucet = await this.data.faucets.create(factory, session);
          const hash = generateTXHash()
          const txRefPayload: TransactionReference = {
            userId: body.userId,
            amount: body.amount,
            hash,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          const txRef = await this.data.transactionReferences.create(txRefPayload, session);
          const txPayload: Transaction = {
            userId,
            walletId: 'faucet',
            txRefId: txRef?._id,
            currency: coin,
            amount,
            signedAmount: amount,
            type: TRANSACTION_TYPE.CREDIT,
            description,
            status: TRANSACTION_STATUS.COMPLETED,
            balanceAfter: faucet?.balance,
            balanceBefore: faucet?.balance,
            hash,
            subType:TRANSACTION_SUBTYPE.CREDIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.FAUCET
          };
          

          const txFactory = await this.txFactoryServices.create(txPayload)
          await this.data.transactions.create(txFactory, session)

        } catch (e) {
          Logger.error(e)
          throw new Error(e)
        }
      }

      await databaseHelper.executeTransaction(processAtomicAction, this.connection)
      return { message: "Faucet created successfully", faucet, status: 200 };
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }
}
