import { FaucetServices } from './faucet-services.services';
import { Module } from "@nestjs/common";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { FaucetFactoryServices } from './faucet-factory.services';
import { TransactionFactoryService } from '../transaction/transaction-factory.services';

@Module({
  imports: [DataServicesModule],
  providers: [FaucetServices, FaucetFactoryServices, TransactionFactoryService],
  exports: [FaucetServices, FaucetFactoryServices],
})
export class FaucetServicesModule { }
