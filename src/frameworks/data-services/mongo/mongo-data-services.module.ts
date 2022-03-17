import { TransactionReference, TransactionReferenceSchema } from './model/transaction-reference.model';
import { Transaction, TransactionSchema } from './model/transaction.model';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MONGO_DB_URL } from 'src/configuration';
import { IDataServices } from 'src/core/abstracts';
import { User, UserSchema } from './model/user.model';
import { Wallet, WalletSchema } from './model/wallet.model';
import { MongoDataServices } from './mongo-data-services.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: TransactionReference.name, schema: TransactionReferenceSchema },

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
export class MongoDataServicesModule { }
