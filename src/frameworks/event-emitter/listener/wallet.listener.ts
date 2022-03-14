import { WalletServices } from 'src/services/use-cases/wallet/wallet-services.services';
import { WalletCreatedEvent } from "./../event/wallet.event";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { OnEvent} from "@nestjs/event-emitter";

@Injectable()
export class WalletCreateListener {
  constructor(
    private walletServices: WalletServices
  ) {}
  @OnEvent("create.wallet", { async: true })
  async handleWalletCreateEvent(event: WalletCreatedEvent) {
    console.log("-------event works ----------");
    console.log(event);
    const { userId, blockchain, network, walletId } = event;
    await this.walletServices.eventCreateWallet({ userId, blockchain, network, walletId });
  }

  @OnEvent("created.wallet", {async: true})
  async handleWalletCreatedEvent(payload) {
    console.log("-------event works ----------");
    await this.walletServices.addWalletToDB(payload);
  }
}
