import { DataServicesModule } from 'src/services/data-services/data-services.module';
import { Module } from "@nestjs/common";
import { AdminFactoryService } from './admin-factory.service';


@Module({
    imports: [DataServicesModule],
    providers: [ AdminFactoryService],
    exports: [AdminFactoryService]
})

export class AdminServicesModule { }