import { Global, Module } from '@nestjs/common';
import { IHttpServices } from 'src/core/abstracts/http-services.abstract';
import { CustomAxiosService } from './axios-service.service';


@Global()
@Module({
    providers: [
        {
            provide: IHttpServices,
            useClass: CustomAxiosService,
        }
    ],
    exports: [IHttpServices]
  })

export class AxiosServiceModule {}