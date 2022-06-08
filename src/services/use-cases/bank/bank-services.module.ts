import { DataServicesModule } from 'src/services/data-services/data-services.module';
import { Module } from "@nestjs/common";
import { BankServices } from './bank-services.services';
import { BankFactoryService } from './bank-factory.services';


@Module({
    imports: [DataServicesModule],
    providers: [BankServices, BankFactoryService],
    exports: [BankServices, BankFactoryService]
})

export class BankServicesModule { }