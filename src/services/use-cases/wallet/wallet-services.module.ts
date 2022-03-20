import { WalletFactoryService } from './wallet-factory.service';
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { WalletServices } from "./wallet-services.services";
import { Module } from "@nestjs/common";

@Module({
  imports: [DataServicesModule],
  providers: [WalletServices, WalletFactoryService],
  exports: [WalletServices],
})
export class WalletServicesModule {}
