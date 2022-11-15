import { Activity } from '../entities/Activity';
import { Bank } from '../entities/Bank';
import { CustomLoggerEntity } from '../entities/CustomLogger';
import { EmailChangeRequest } from '../entities/email-change-request.entity';
import { Faucet } from '../entities/faucet.entity';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { Withdrawal } from '../entities/Withdrawal';
import { IGenericRepository } from './generic-repository.abstract';
import { Notification } from '../entities/notification.entity';
import { QuickTrade, QuickTradeContract } from '../entities/QuickTrade';
import { ExchangeRate } from '../entities/Rate';
import { Admin } from '../entities/Admin';
import { Kyc } from '../entities/Kyc';
import { Fee } from '../entities/Fee';
import { FeeWallet } from '../entities/FeeWallet';
import { UserFeatureManagement } from '../entities/UserFeatureManagement';
import { CoinWithdrawalFee } from '../entities/CoinWithdrawalFee';
import { Coin } from '../entities/Coin';
import { P2pAds } from '../entities/P2pAds';
import { P2pAdBank } from '../entities/P2pAdsBank';
import { P2pOrder } from '../entities/P2pOrder';
import { WebPush } from '../entities/WebPush';
import { FeatureManagement } from '../entities/Feature-Management';
import { ChatMessage } from '../entities/Chat-Messages';
import { TradeDispute } from '../entities/Trade-Disputes';
import { MutateUser } from '../entities/MutateUser';

export abstract class IDataServices {
  abstract users: IGenericRepository<User>;
  abstract wallets: IGenericRepository<Wallet>;
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
  abstract exchangeRates: IGenericRepository<ExchangeRate>
  abstract admins: IGenericRepository<Admin>
  abstract kyc: IGenericRepository<Kyc>
  abstract fees: IGenericRepository<Fee>
  abstract feeWallets: IGenericRepository<FeeWallet>
  abstract userFeatureManagement: IGenericRepository<UserFeatureManagement>
  abstract coinWithdrawalFee: IGenericRepository<CoinWithdrawalFee>
  abstract coins: IGenericRepository<Coin>
  abstract p2pAds: IGenericRepository<P2pAds>
  abstract p2pAdBanks: IGenericRepository<P2pAdBank>
  abstract p2pOrders: IGenericRepository<P2pOrder>
  abstract webPush: IGenericRepository<WebPush>
  abstract featureManagement: IGenericRepository<FeatureManagement>
  abstract tradeDisputes: IGenericRepository<TradeDispute>
  abstract chatMessages: IGenericRepository<ChatMessage>
  abstract mutateUser: IGenericRepository<MutateUser>

} 

