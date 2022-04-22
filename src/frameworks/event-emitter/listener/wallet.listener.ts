import { WalletCreatedEvent } from "./../event/wallet.event";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";

import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { BLOCKCHAIN_CHAIN, CoinType } from "src/lib/constants";
import { TATUM_BTC_ACCOUNT_ID, TATUM_USDC_ACCOUNT_ID, TATUM_USDT_ACCOUNT_ID, TATUM_USDT_TRON_ACCOUNT_ID } from "src/configuration";
import { UserDetail } from "src/core/entities/user.entity";
import { IDataServices } from "src/core/abstracts";





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
    const user = await this.data.users.findOne({ _id: userId })
    if (!user) return "user does not exists";

    const userDetail: UserDetail = { email: user.email, fullName: `${user.firstName} ${user.lastName}` };

    await this.walletQueue.add(
      {
        userId,
        coin: CoinType.BTC,
        accountId: TATUM_BTC_ACCOUNT_ID,
        chain: BLOCKCHAIN_CHAIN.BTC,
        userDetail
      },
      { delay: 5000 }
    );

    await this.walletQueue.add(
      {
        userId,
        coin: CoinType.USDT,
        accountId: TATUM_USDT_ACCOUNT_ID,
        chain: BLOCKCHAIN_CHAIN.ETH,
        userDetail
      },
      { delay: 5000 }
    );

    await this.walletQueue.add(
      {
        userId,
        coin: CoinType.USDC,
        accountId: TATUM_USDC_ACCOUNT_ID,
        chain: BLOCKCHAIN_CHAIN.ETH,
        userDetail

      },
      { delay: 15000 }
    );

    await this.walletQueue.add(
      {
        userId,
        coin: CoinType.USDT_TRON,
        accountId: TATUM_USDT_TRON_ACCOUNT_ID,
        chain: BLOCKCHAIN_CHAIN.TRON,
        userDetail
      },
      { delay: 25000 }
    );

    await this.walletQueue.add(
      {
        userId,
        coin: CoinType.NGN,
        accountId: "",
        chain: "",
        userDetail
      },
      { delay: 35000 }
    );



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
