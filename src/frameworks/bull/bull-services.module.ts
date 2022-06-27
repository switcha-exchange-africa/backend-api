import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import config from "../in-memory-database/redis/redis-config"
import { DataServicesModule } from 'src/services/data-services/data-services.module';
import { WalletFactoryService } from 'src/services/use-cases/wallet/wallet-factory.service';
import { WalletWebhookSubscriptionConsumer } from './wallet-webhook-subsciption.consumer';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      redis: config,
    }),
    DataServicesModule
  ],
  providers: [ WalletWebhookSubscriptionConsumer, WalletFactoryService],
})
export class BullServiceModule { }

