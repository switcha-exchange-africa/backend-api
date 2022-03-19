import { FaucetServices } from './faucet-services.services';
import { Module } from "@nestjs/common";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { WalletServicesModule } from "../wallet-services.module";
import { WalletServices } from "../wallet-services.services";
import { FaucetFactoryServices } from './faucet-factory.services';

@Module({
  imports: [DataServicesModule],
  providers: [FaucetServices, FaucetFactoryServices],
  exports: [FaucetServices, FaucetFactoryServices],
})
export class FaucetServicesModule {}
