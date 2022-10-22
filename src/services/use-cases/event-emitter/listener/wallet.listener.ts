import { WalletCreatedEvent } from "../event/wallet.event";
import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { IDataServices } from "src/core/abstracts";
import { CoinType } from "src/core/types/coin";





@Injectable()
export class WalletCreateListener {
  constructor(
    private data: IDataServices,
    @InjectQueue('wallet') private walletQueue: Queue,
    @InjectQueue('wallet.webhook.subscription') private walletWebhookQueue: Queue,

  ) { }

  @OnEvent("create.wallet", { async: true })
  async handleWalletCreateEvent(event: WalletCreatedEvent) {

    const userId = event.userId
    const fullName = event.fullName
    const email = event.email

    const user = await this.data.users.findOne({ _id: userId })

    if (!user) {
      Logger.error("User does not exists")
      return "user does not exists";
    }
    await Promise.all([
      this.walletQueue.add({
        userId,
        fullName,
        email,
        coin: CoinType.BTC
      }, { delay: 5000 }),
      this.walletQueue.add({
        userId,
        fullName,
        email,
        coin: CoinType.USDT
      }, { delay: 5000 }),
      this.walletQueue.add({
        userId,
        fullName,
        email,
        coin: CoinType.USDC
      }, { delay: 15000 }),
      this.walletQueue.add({
        userId,
        fullName,
        email,
        coin: CoinType.USDT_TRON
      }, { delay: 25000 }),
      this.walletQueue.add({
        userId,
        fullName,
        email,
        coin: CoinType.NGN
      }, { delay: 35000 }),
      this.walletQueue.add({
        userId,
        fullName,
        email,
        coin: CoinType.ETH
      }, { delay: 45000 })
    ])

  }

  @OnEvent("send.webhook.subscription", { async: true })
  async handleWebhookSubscriptionEvent(event: any) {
    const { chain, address } = event
    await this.walletWebhookQueue.add(
      { chain, address },
      { delay: 1000 }
    );

  }
  @OnEvent("created.wallet", { async: true })
  async handleWalletCreatedEvent() { }
}
