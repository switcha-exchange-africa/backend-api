import { Module } from "@nestjs/common";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { RatesServices } from "./rates-services.services";

@Module({
    imports: [DataServicesModule],
    providers: [RatesServices],
    exports: [RatesServices]
})

export class RatesServicesModule{}