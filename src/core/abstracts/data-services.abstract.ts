import { TransactionReference } from '../entities/transaction-reference.entity';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { IGenericRepository } from './generic-repository.abstract';

export abstract class IDataServices {
  abstract users: IGenericRepository<User>;
  abstract wallets: IGenericRepository<Wallet>;
  abstract transactionReferences: IGenericRepository<TransactionReference>
  abstract transactions: IGenericRepository<Transaction>
}
