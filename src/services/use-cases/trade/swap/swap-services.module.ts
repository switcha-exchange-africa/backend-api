import { TransactionFactoryService } from "src/services/use-cases/transaction/transaction-factory.services";
import { Module } from "@nestjs/common";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { SwapServices } from "./swap-services.services";

@Module({
  imports: [DataServicesModule],
  providers: [SwapServices, TransactionFactoryService],
  exports: [SwapServices, TransactionFactoryService],
})
export class SwapServicesModule {}
