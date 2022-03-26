import { IDataServices } from "src/core/abstracts";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { FaucetFactoryServices } from "./faucet-factory.services";
import databaseHelper from "src/frameworks/data-services/mongo/database-helper";
import * as mongoose from 'mongoose';
import { InjectConnection } from "@nestjs/mongoose";
import { TransactionReference } from "src/core/entities/transaction-reference.entity";
import { TransactionFactoryService } from "../transaction/transaction-factory.services";
import { Transaction } from "src/core/entities/transaction.entity";
import { COIN_TYPES, CUSTOM_TRANSACTION_TYPE, TRANSACTION_STATUS, TRANSACTION_SUBTYPE, TRANSACTION_TYPE } from "src/lib/constants";
import { TransactionReferenceFactoryService } from "../transaction/transaction-reference.services";
import { Faucet } from "src/core/entities/faucet.entity";
import { ResponsesType } from 'src/core/types/response';

@Injectable()
export class FaucetServices {
  constructor(
    private data: IDataServices,
    private faucetFactoryServices: FaucetFactoryServices,
    private txFactoryServices: TransactionFactoryService,
    private txRefFactoryServices: TransactionReferenceFactoryService,

    @InjectConnection() private readonly connection: mongoose.Connection,
  ) { }

  async create(body: { amount: number, description: string, coin: string, userId: string }): Promise<ResponsesType<Faucet>> {
    try {
      // atomic transaction
      const { amount, description, coin, userId } = body
      let faucet: any
      const processAtomicAction = async (session: mongoose.ClientSession) => {
        try {
          const faucetFactory = await this.faucetFactoryServices.create(body);
          faucet = await this.data.faucets.create(faucetFactory, session);


          const txRefPayload: TransactionReference = { userId, amount };
          const txRefFactory = await this.txRefFactoryServices.create(txRefPayload)
          const txRef = await this.data.transactionReferences.create(txRefFactory, session);

          const txPayload: Transaction = {
            userId,
            walletId: 'faucet',
            txRefId: txRef?._id,
            currency: coin as COIN_TYPES,
            amount,
            signedAmount: amount,
            type: TRANSACTION_TYPE.CREDIT,
            description,
            status: TRANSACTION_STATUS.COMPLETED,
            balanceAfter: faucet?.balance,
            balanceBefore: faucet?.balance,
            hash: txRef.hash,
            subType: TRANSACTION_SUBTYPE.CREDIT,
            customTransactionType: CUSTOM_TRANSACTION_TYPE.FAUCET
          };


          const txFactory = await this.txFactoryServices.create(txPayload)
          await this.data.transactions.create(txFactory, session)

        } catch (e) {
          throw new HttpException(e.message, 500)
        }
      }

      await databaseHelper.executeTransaction(processAtomicAction, this.connection)
      return { message: "Faucet created successfully", data: faucet, status: HttpStatus.CREATED };

    } catch (error) {
      if (error.name === 'TypeError') throw new HttpException(error.message, 500)
      throw error;
    }
  }
}
