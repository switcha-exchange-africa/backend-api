import { DataServicesModule } from "src/services/data-services/data-services.module";
import { Module } from "@nestjs/common";
import { FeeWalletFactoryService } from "./fee-wallet-factory.service";
import { FeeWalletServices } from "./fee-wallet.service";
import { UtilsServicesModule } from "../utils/utils.module";
import { WithdrawalLib } from "../withdrawal/withdrawal.lib";

@Module({
  imports: [
    DataServicesModule,
    UtilsServicesModule
  ],
  providers: [FeeWalletServices, FeeWalletFactoryService, WithdrawalLib],
  exports: [FeeWalletServices, FeeWalletFactoryService],
})
export class FeeWalletServicesModule { }
