import { DataServicesModule } from 'src/services/data-services/data-services.module';
import { Module } from "@nestjs/common";
import { TransactionServices } from './transaction-services.services';


@Module({
    imports: [DataServicesModule],
    providers: [TransactionServices],
    exports: [TransactionServices]
})

export class TransactionServicesModule{}