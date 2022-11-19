import { IWalletSubscription, WalletCreatedEvent } from "../event/wallet.event";
import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { IDataServices } from "src/core/abstracts";
import { CoinType } from "src/core/types/coin";
import { API_URL, env, TATUM_API_KEY, TATUM_BASE_URL } from "src/configuration";
import { IErrorReporter } from "src/core/types/error";
import { UtilsServices } from "../../utils/utils.service";
import { IHttpServices } from "src/core/abstracts/http-services.abstract";





@Injectable()
export class WalletCreateListener {
  constructor(
    private data: IDataServices,
    private readonly utilsService: UtilsServices,
    private http: IHttpServices,
    @InjectQueue(`${env.env}.wallet`) private walletQueue: Queue
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
  async handleWebhookSubscriptionEvent(event: IWalletSubscription) {
    const { accountId } = event
    try {
      const CONFIG = {
        headers: {
          "X-API-Key": TATUM_API_KEY
        },
      };
      const incomingTransaction = await this.http.post(`${TATUM_BASE_URL}/subscription`,
        {
          type: "ACCOUNT_INCOMING_BLOCKCHAIN_TRANSACTION",
          attr: {
            id: accountId,
            url: `${API_URL}/api/v1/webhook/tatum-virtual-account-incoming-transaction`,
          },
        },
        CONFIG
      )
      const pendingTransaction = await this.http.post(`${TATUM_BASE_URL}/subscription`,
        {
          type: "ACCOUNT_PENDING_BLOCKCHAIN_TRANSACTION",
          attr: {
            id: accountId,
            url: `${API_URL}/api/v1/webhook/tatum-virtual-account-pending-transaction`,
          },
        },
        CONFIG
      )
      // const withdrawalTransaction = await this.http.post(`${TATUM_BASE_URL}/subscription`,
      //   {
      //     type: "TRANSACTION_IN_THE_BLOCK",
      //     attr: {
      //       url: `${API_URL}/api/v1/webhook/tatum-tx-block`,
      //     },
      //   },
      //   CONFIG
      // )
      await this.data.virtualAccounts.update(
        { accountId },
        {
          pendingTransactionSubscriptionId: pendingTransaction.id,
          incomingTransactionSubscriptionId: incomingTransaction.id,
          // withdrawalTransactionSubscriptionId: withdrawalTransaction.id
        })
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'GENERATING NON CUSTODIAL WALLET',
        error,
        email: accountId,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
    }
  }
  @OnEvent("created.wallet", { async: true })
  async handleWalletCreatedEvent() { }
}
