import { Transaction, TransactionSchema } from "./model/Transaction.model";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { GONDOR_DB_URL, MONGO_DB_URL } from "src/configuration";
import { IDataServices } from "src/core/abstracts";
import { User, UserSchema } from "./model/User";
import { Wallet, WalletSchema } from "./model/Wallet";
import { MongoDataServices } from "./mongo-data-services.service";
import { Faucet, FaucetSchema } from "./model/Faucet";
import { Withdrawal, WithdrawalSchema } from "./model/Withdrawal";
import { Activity, ActivitySchema } from "./model/Activity";
import { Bank, BankSchema } from "./model/Bank";
import { EmailChangeRequestSchema, EmailChangeRequest } from "./model/Email-Change-Request.model";
import { CustomLogger, CustomLoggerSchema } from "./model/CustomLogger";
import { Notification, NotificationSchema } from "./model/Notification";
import { QuickTrade, QuickTradeSchema } from "./model/Quick-Trade";
import { QuickTradeContract, QuickTradeContractSchema } from "./model/Quick-Trade-Contract";
import { ExchangeRate, ExchangeRateSchema } from "./model/ExchangeRate";
import { Admin, AdminSchema } from "./model/Admin";
import { Kyc, KycSchema } from "./model/Kyc";
import { Fee, FeeSchema } from "./model/Fee";
import { FeeWallet, FeeWalletSchema } from "./model/Fee-Wallet";
import { UserFeatureManagement, UserFeatureManagementSchema } from "./model/UserFeatureManagement";
import { CoinWithdrawalFee, CoinWithdrawalFeeSchema } from "./model/CoinWithdrawalFee";
import { Coin, CoinSchema } from "./model/Coin";
import { P2pAds, P2pAdsSchema } from "./model/P2P-Ads";
import { P2pAdBank, P2pAdBankSchema } from "./model/P2P-Ad-Banks";
import { P2pOrder, P2pOrderSchema } from "./model/P2p-Order";
import { WebPush, WebPushSchema } from "./model/Web-Push";
import { FeatureManagement, FeatureManagementSchema } from "./model/Feature-Management";
import { ChatMessage, ChatMessageSchema } from "./model/Chat-Messages";
import { TradeDispute, TradeDisputeSchema } from "./model/Trade-Dispute";
import { MutateUser, MutateUserSchema } from './model/MutateUser';
import { TwoFa, TwoFaSchema } from './model/TwoFa';
import { VirtualAccount, VirtualAccountSchema } from "./model/Virtual-Account";
import { DepositAddress, DepositAddressSchema } from "./model/Deposit-Addresses";
import { Gondor, GondorSchema } from "./model/Gondor";
import { LockedBalance, LockedBalanceSchema } from "./model/Locked-Balances";
import { LoginHistory, LoginHistorySchema } from "./model/LoginHistory";
import { Deactivated2faRequest, Deactivated2faRequestSchema } from "./model/Deactivate2faRequests";
import { BlockchainFeesAccrued, BlockchainFeesAccruedSchema } from "./model/BlockchainFeesAccrued";

@Module({
  imports: [
    MongooseModule.forRoot(MONGO_DB_URL, {
      connectionName: 'switcha',
    }),
    MongooseModule.forRoot(GONDOR_DB_URL, {
      connectionName: 'gondor',
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Faucet.name, schema: FaucetSchema },
      { name: Withdrawal.name, schema: WithdrawalSchema },
      { name: Activity.name, schema: ActivitySchema },
      { name: Bank.name, schema: BankSchema },
      { name: EmailChangeRequest.name, schema: EmailChangeRequestSchema },
      { name: CustomLogger.name, schema: CustomLoggerSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: QuickTrade.name, schema: QuickTradeSchema },
      { name: QuickTradeContract.name, schema: QuickTradeContractSchema },
      { name: ExchangeRate.name, schema: ExchangeRateSchema },
      { name: Admin.name, schema: AdminSchema },
      { name: Kyc.name, schema: KycSchema },
      { name: Fee.name, schema: FeeSchema },
      { name: FeeWallet.name, schema: FeeWalletSchema },
      { name: UserFeatureManagement.name, schema: UserFeatureManagementSchema },
      { name: CoinWithdrawalFee.name, schema: CoinWithdrawalFeeSchema },
      { name: Coin.name, schema: CoinSchema },
      { name: P2pAds.name, schema: P2pAdsSchema },
      { name: P2pAdBank.name, schema: P2pAdBankSchema },
      { name: P2pOrder.name, schema: P2pOrderSchema },
      { name: WebPush.name, schema: WebPushSchema },
      { name: FeatureManagement.name, schema: FeatureManagementSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: TradeDispute.name, schema: TradeDisputeSchema },
      { name: MutateUser.name, schema: MutateUserSchema },
      { name: TwoFa.name, schema: TwoFaSchema },
      { name: VirtualAccount.name, schema: VirtualAccountSchema },
      { name: DepositAddress.name, schema: DepositAddressSchema },
      { name: LockedBalance.name, schema: LockedBalanceSchema },
      { name: LoginHistory.name, schema: LoginHistorySchema },
      { name: Deactivated2faRequest.name, schema: Deactivated2faRequestSchema },
      { name: BlockchainFeesAccrued.name, schema: BlockchainFeesAccruedSchema },

      
      
    ], 'switcha'),
    MongooseModule.forFeature([
      { name: Gondor.name, schema: GondorSchema }
    ], 'gondor')


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


