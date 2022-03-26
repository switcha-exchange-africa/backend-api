import { FaucetServices } from './faucet-services.services';
import { Module } from "@nestjs/common";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { FaucetFactoryServices } from './faucet-factory.services';
import { TransactionFactoryService } from '../transaction/transaction-factory.services';
import { TransactionReferenceFactoryService } from '../transaction/transaction-reference.services';

@Module({
  imports: [DataServicesModule],
  providers: [FaucetServices, FaucetFactoryServices, TransactionFactoryService, TransactionReferenceFactoryService],
  exports: [FaucetServices, FaucetFactoryServices],
})
export class FaucetServicesModule { }
