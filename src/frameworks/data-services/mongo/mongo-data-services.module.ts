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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: TransactionReference.name, schema: TransactionReferenceSchema },
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
