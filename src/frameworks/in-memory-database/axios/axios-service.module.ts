import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { IAPICallServices } from 'src/core/abstracts/api-call.abstract';
import { CustomAxiosService } from './axios-service.service';


@Global()
@Module({
    imports: [HttpModule],
    providers: [
        {
            provide: IAPICallServices,
            useClass: CustomAxiosService,
        }
    ],
    exports: [IAPICallServices]
  })

export class AxiosServiceModule {}