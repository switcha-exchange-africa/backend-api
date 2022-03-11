import { WalletCreatedEvent } from './../event/wallet.event';
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";


@Injectable()
export class WalletCreateListener{
    @OnEvent('create.wallet', { async: true })
    async handleWalletCreateEvent(event: WalletCreatedEvent){
        console.log("-------event works ----------")
        console.log(event);
        const {address } = event
    }

    @OnEvent('created.wallet')
    handleWalletCreatedEvent(event: WalletCreatedEvent){
        console.log("-------event works ----------")
        console.log(event);
        const {address } = event
    }
}