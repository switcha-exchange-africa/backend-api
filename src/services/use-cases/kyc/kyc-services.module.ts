import { DataServicesModule } from 'src/services/data-services/data-services.module';
import { Module } from "@nestjs/common";
import { KycFactoryService } from './kyc-factory.service';
import { KycServices } from './kyc-services.service';


@Module({
  imports: [DataServicesModule],
  providers: [KycServices, KycFactoryService],
  exports: [KycServices, KycFactoryService]
})

export class KycServicesModule { }