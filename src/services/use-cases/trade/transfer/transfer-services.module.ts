import { TransactionFactoryService } from 'src/services/use-cases/transaction/transaction-factory.services';
import { DataServicesModule } from 'src/services/data-services/data-services.module';
import { Module } from "@nestjs/common";
import { TransferServices } from './transfer-services.services';
import { UtilsServicesModule } from '../../utils/utils.module';

@Module({
    imports: [DataServicesModule, UtilsServicesModule],
    providers: [TransferServices, TransactionFactoryService],
    exports: [TransferServices]
})
export class TransferServicesModule { }