import { Module } from "@nestjs/common";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { UtilsServicesModule } from "../utils/utils.module";
import { RatesServices } from "./rates-services.services";

@Module({
    imports: [DataServicesModule, UtilsServicesModule],
    providers: [RatesServices],
    exports: [RatesServices]
})

export class RatesServicesModule { }