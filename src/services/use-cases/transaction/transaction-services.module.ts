import { DataServicesModule } from 'src/services/data-services/data-services.module';
import { Module } from "@nestjs/common";
import { TransactionServices } from './transaction-services.services';
import { TransactionFactoryService } from './transaction-factory.services';
import { UtilsServicesModule } from '../utils/utils.module';


@Module({
    imports: [DataServicesModule, UtilsServicesModule],
    providers: [TransactionServices, TransactionFactoryService],
    exports: [TransactionServices, TransactionFactoryService]
})

export class TransactionServicesModule { }