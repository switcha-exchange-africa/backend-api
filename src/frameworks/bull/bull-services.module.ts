import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import config from "../in-memory-database/redis/redis-config"
import { DataServicesModule } from 'src/services/data-services/data-services.module';
import { CreateWalletTaskConsumer } from './wallet-consumer.service';
import { WalletServicesModule } from 'src/services/use-cases/wallet/wallet-services.module';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      redis: config,
    }),
    DataServicesModule,
    WalletServicesModule,
  ],
  providers: [CreateWalletTaskConsumer],
})
export class BullServiceModule { }