
import { Module } from "@nestjs/common";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { TransactionFactoryService } from "../transaction/transaction-factory.services";
import { BuySellServices } from "./buy-sell-services.services";


@Module({
    imports: [DataServicesModule],
    providers: [BuySellServices, TransactionFactoryService],
    exports: [BuySellServices, TransactionFactoryService]
})

export class BuySellServicesModule{}