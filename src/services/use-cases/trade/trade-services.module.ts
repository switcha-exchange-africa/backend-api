
import { Module } from "@nestjs/common";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { TransactionFactoryService } from "../transaction/transaction-factory.services";
import { TradeServices } from "./trade-services.services";


@Module({
    imports: [DataServicesModule],
    providers: [TradeServices, TransactionFactoryService],
    exports: [TradeServices, TransactionFactoryService]
})

export class TradeServicesModule{}