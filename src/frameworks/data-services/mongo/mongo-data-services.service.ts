import { Transaction, TransactionDocument } from './model/Transaction.model';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoGenericRepository } from './mongo-generic-repository';
import { User, UserDocument } from './model/User';
import { Wallet, WalletDocument } from './model/Wallet';
import { IDataServices } from 'src/core/abstracts';
import { TransactionReference, TransactionReferenceDocument } from './model/transaction-reference.model';
import { FaucetDocument, Faucet } from './model/Faucet';
import { Withdrawal, WithdrawalDocument } from './model/Withdrawal';
import { Bank, BankDocument } from './model/Bank';
import { Activity, ActivityDocument } from './model/Activity';
import { EmailChangeRequest, EmailChangeRequestDocument } from './model/Email-Change-Request.model';


@Injectable()
export class MongoDataServices
  implements IDataServices, OnApplicationBootstrap {
  users: MongoGenericRepository<User>;
  wallets: MongoGenericRepository<Wallet>;
  transactionReferences: MongoGenericRepository<TransactionReference>;
  transactions: MongoGenericRepository<Transaction>;
  faucets: MongoGenericRepository<Faucet>;
  withdrawals: MongoGenericRepository<Withdrawal>;
  banks: MongoGenericRepository<Bank>;
  activities: MongoGenericRepository<Activity>;
  emailChangeRequests: MongoGenericRepository<EmailChangeRequest>;



  constructor(
    @InjectModel(User.name)
    private UserRepository: Model<UserDocument>,

    @InjectModel(Wallet.name)
    private WalletRepository: Model<WalletDocument>,

    @InjectModel(TransactionReference.name)
    private TransactionReferenceRepository: Model<TransactionReferenceDocument>,

    @InjectModel(Transaction.name)
    private TransactionRepository: Model<TransactionDocument>,

    @InjectModel(Faucet.name)
    private FaucetRepository: Model<FaucetDocument>,

    @InjectModel(Withdrawal.name)
    private WithdrawalRepository: Model<WithdrawalDocument>,

    @InjectModel(Bank.name)
    private BankRepository: Model<BankDocument>,

    @InjectModel(Activity.name)
    private ActivityRepository: Model<ActivityDocument>,

    @InjectModel(EmailChangeRequest.name)
    private EmailChangeRequestRepository: Model<EmailChangeRequestDocument>,

  ) { }


  onApplicationBootstrap() {
    this.users = new MongoGenericRepository<User>(this.UserRepository);
    this.wallets = new MongoGenericRepository<Wallet>(this.WalletRepository)
    this.transactions = new MongoGenericRepository<Transaction>(this.TransactionRepository)
    this.transactionReferences = new MongoGenericRepository<TransactionReference>(this.TransactionReferenceRepository)
    this.faucets = new MongoGenericRepository<Faucet>(this.FaucetRepository)
    this.withdrawals = new MongoGenericRepository<Withdrawal>(this.WithdrawalRepository)
    this.banks = new MongoGenericRepository<Bank>(this.BankRepository, ['userId'])
    this.activities = new MongoGenericRepository<Activity>(this.ActivityRepository)
    this.emailChangeRequests = new MongoGenericRepository<EmailChangeRequest>(this.EmailChangeRequestRepository)

    // this.books = new MongoGenericRepository<Book>(this.BookRepository, [
    //   'author',
    //   'genre',
    // ]);
  }
}
