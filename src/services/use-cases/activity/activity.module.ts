import { DataServicesModule } from 'src/services/data-services/data-services.module';
import { Module } from "@nestjs/common";
import { ActivityFactoryService } from './activity-factory.service';
import { ActivityServices } from './activity.service';
import { UtilsServicesModule } from '../utils/utils.module';


@Module({
  imports: [DataServicesModule, UtilsServicesModule],
  providers: [ActivityServices, ActivityFactoryService],
  exports: [ActivityServices, ActivityFactoryService]
})

export class ActivityServicesModule { }