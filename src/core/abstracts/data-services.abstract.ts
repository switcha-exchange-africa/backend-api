import { Activity } from '../entities/Activity';
import { Bank } from '../entities/Bank';
import { CustomLoggerEntity } from '../entities/CustomLogger';
import { EmailChangeRequest } from '../entities/email-change-request.entity';
import { Faucet } from '../entities/faucet.entity';
import { TransactionReference } from '../entities/transaction-reference.entity';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { Withdrawal } from '../entities/Withdrawal';
import { IGenericRepository } from './generic-repository.abstract';
import { Notification } from '../entities/notification.entity';
import { QuickTrade, QuickTradeContract } from '../entities/QuickTrade';
import { Rate } from '../entities/Rate';

export abstract class IDataServices {
  abstract users: IGenericRepository<User>;
  abstract wallets: IGenericRepository<Wallet>;
  abstract transactionReferences: IGenericRepository<TransactionReference>
  abstract transactions: IGenericRepository<Transaction>
  abstract faucets: IGenericRepository<Faucet>
  abstract withdrawals: IGenericRepository<Withdrawal>
  abstract banks: IGenericRepository<Bank>
  abstract activities: IGenericRepository<Activity>
  abstract emailChangeRequests: IGenericRepository<EmailChangeRequest>
  abstract customLogger: IGenericRepository<CustomLoggerEntity>
  abstract notifications: IGenericRepository<Notification>
  abstract quickTrades: IGenericRepository<QuickTrade>
  abstract quickTradeContracts: IGenericRepository<QuickTradeContract>
  abstract rates: IGenericRepository<Rate>

}