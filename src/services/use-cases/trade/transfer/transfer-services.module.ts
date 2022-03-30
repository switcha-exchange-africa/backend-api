import { TransactionFactoryService } from 'src/services/use-cases/transaction/transaction-factory.services';
import { DataServicesModule } from 'src/services/data-services/data-services.module';
import { Module } from "@nestjs/common";
import { TransferServices } from './transfer-services.services';

@Module({
    imports: [DataServicesModule],
    providers: [TransferServices, TransactionFactoryService],
    exports: [TransferServices]
})
export class TransferServicesModule{}