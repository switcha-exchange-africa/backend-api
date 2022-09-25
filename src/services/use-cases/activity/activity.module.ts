import { DataServicesModule } from 'src/services/data-services/data-services.module';
import { Module } from "@nestjs/common";
import { ActivityFactoryService } from './activity-factory.service';
import { ActivityServices } from './activity.service';


@Module({
  imports: [DataServicesModule],
  providers: [ActivityServices, ActivityFactoryService],
  exports: [ActivityServices, ActivityFactoryService]
})

export class ActivityServicesModule { }