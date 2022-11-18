
import { Module } from "@nestjs/common";
import { AxiosServiceModule } from "src/frameworks/http/axios/axios-service.module";
import { DiscordServicesModule } from "src/frameworks/notification-services/discord/discord-service.module";
import { DataServicesModule } from "src/services/data-services/data-services.module";
import { UtilsServicesModule } from "../utils/utils.module";
import { VirtualAccountFactoryService } from "./non-custodial-factory.service";
import { NonCustodialWalletLib } from "./non-custodial.lib";
import { NonCustodialWalletServices } from "./non-custodial.service";

@Module({
    imports: [
        DataServicesModule,
        AxiosServiceModule,
        DiscordServicesModule,
        UtilsServicesModule
    ],
    providers: [
        NonCustodialWalletServices,
        VirtualAccountFactoryService,
        NonCustodialWalletLib
    ],
    exports: [
        NonCustodialWalletServices,
        NonCustodialWalletLib
    ]
})

export class NonCustodialWalletServicesModule { }