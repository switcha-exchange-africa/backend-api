import { DataServicesModule } from 'src/services/data-services/data-services.module';
import { Module } from "@nestjs/common";
import { KycFactoryService } from './kyc-factory.service';
import { KycServices } from './kyc-services.service';
import { UtilsServicesModule } from '../utils/utils.module';


@Module({
  imports: [DataServicesModule, UtilsServicesModule],
  providers: [KycServices, KycFactoryService],
  exports: [KycServices, KycFactoryService]
})

export class KycServicesModule { }