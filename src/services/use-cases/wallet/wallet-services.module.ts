import { DataServicesModule } from 'src/services/data-services/data-services.module';
import { WalletServices } from './wallet-services.services';
import { Module } from "@nestjs/common";

@Module({
    imports:[DataServicesModule],
    providers: [WalletServices],
    exports: [WalletServices]
})

export class WalletServicesModule{}