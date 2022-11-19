import { DataServicesModule } from 'src/services/data-services/data-services.module';
import { Module } from "@nestjs/common";
import { UtilsServicesModule } from '../utils/utils.module';
import { DepositAddressFactoryService } from './virtual-account.factory';
import { VirtualAccountServices } from './virtual-account.service';
import { VirtualAccountLib } from './virtual-acount.lib';
import { TransactionFactoryService } from '../transaction/transaction-factory.services';


@Module({
    imports: [DataServicesModule, UtilsServicesModule],
    providers: [VirtualAccountServices, DepositAddressFactoryService, VirtualAccountLib, TransactionFactoryService],
    exports: [VirtualAccountServices, DepositAddressFactoryService]
})

export class VirtualAccountServicesModule { }