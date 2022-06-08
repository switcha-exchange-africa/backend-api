import {
  TransactionReference,
  TransactionReferenceSchema,
} from "./model/transaction-reference.model";
import { Transaction, TransactionSchema } from "./model/Transaction.model";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MONGO_DB_URL } from "src/configuration";
import { IDataServices } from "src/core/abstracts";
import { User, UserSchema } from "./model/User";
import { Wallet, WalletSchema } from "./model/Wallet";
import { MongoDataServices } from "./mongo-data-services.service";
import { Faucet, FaucetSchema } from "./model/Faucet";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: TransactionReference.name, schema: TransactionReferenceSchema },
      { name: Faucet.name, schema: FaucetSchema },
    ]),
    MongooseModule.forRoot(MONGO_DB_URL),
  ],
  providers: [
    {
      provide: IDataServices,
      useClass: MongoDataServices,
    },
  ],
  exports: [IDataServices],
})
export class MongoDataServicesModule {}
