import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import config from "src/frameworks/in-memory-database/redis/redis-config"
import { DataServicesModule } from 'src/services/data-services/data-services.module';
import { CreateWalletTaskConsumer } from './wallet-consumer.service';
import { WalletServicesModule } from 'src/services/use-cases/wallet/wallet-services.module';
import { OrderExpiryTaskConsumer } from './order.consumer';
import { NotificationFactoryService } from '../notification/notification-factory.service';
import { DiscordServicesModule } from 'src/frameworks/notification-services/discord/discord-service.module';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      redis: config,
    }),
    DataServicesModule,
    WalletServicesModule,
    DiscordServicesModule,

  ],
  providers: [
    CreateWalletTaskConsumer,
    OrderExpiryTaskConsumer,
    NotificationFactoryService
  ],
})
export class BullServiceModule { }