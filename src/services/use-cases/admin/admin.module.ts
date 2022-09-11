import { DataServicesModule } from 'src/services/data-services/data-services.module';
import { Module } from "@nestjs/common";
import { AdminFactoryService } from './admin-factory.service';
import { AdminServices } from './admin-services.services';


@Module({
    imports: [DataServicesModule],
    providers: [AdminServices, AdminFactoryService],
    exports: [AdminServices, AdminFactoryService]
})

export class AdminServicesModule { }