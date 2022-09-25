import { DataServicesModule } from "src/services/data-services/data-services.module";
import { Module } from "@nestjs/common";
import { FeeWalletFactoryService } from "./fee-wallet-factory.service";
import { FeeWalletServices } from "./fee-wallet.service";

@Module({
  imports: [
    DataServicesModule,

  ],
  providers: [FeeWalletServices, FeeWalletFactoryService],
  exports: [FeeWalletServices, FeeWalletFactoryService],
})
export class FeeWalletServicesModule {}
