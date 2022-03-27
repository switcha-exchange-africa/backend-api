import { WalletFactoryService } from "src/services/use-cases/wallet/wallet-factory.service";
import { IDataServices } from "src/core/abstracts";
import { IHttpServices } from "src/core/abstracts/http-services.abstract";
import { WalletCreatedEvent } from "./../event/wallet.event";
import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { API_URL, TATUM_API_KEY, TATUM_BASE_URL } from "src/configuration";
import { UserDetail } from "src/core/entities/user.entity";
import { COIN_TYPES } from "src/lib/constants";
import { Wallet } from "src/core/entities/wallet.entity";


const CONFIG = {
  headers: {
    "X-API-Key": TATUM_API_KEY
  },
};
@Injectable()
export class WalletCreateListener {
  constructor(
    private httpServices: IHttpServices,
    private dataServices: IDataServices,
    private walletFactoryService: WalletFactoryService
  ) { }

  @OnEvent("create.wallet", { async: true })
  async handleWalletCreateEvent(event: WalletCreatedEvent) {
    const { userId, coin, accountId } = event;

    try {
      const [user, wallet] = await Promise.all([
        this.dataServices.users.findOne({ _id: userId }),
        this.dataServices.wallets.findOne({ userId, coin }),
      ]);
      if (!user) return "user does not exists";
      if (wallet) {
        Logger.warn(`${coin} already exists`);
        return;
      }

      const userDetail: UserDetail = {
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
      };

      if (coin !== COIN_TYPES.NGN) {
        const { address, destinationTag, memo, message } = await this.httpServices.post(
          `${TATUM_BASE_URL}/offchain/account/${accountId}/address`,
          {},
          CONFIG
        )
        // create subscription for address
        address
          ? await this.httpServices.post(
            `${TATUM_BASE_URL}/subscription`,
            {
              type: "ADDRESS_TRANSACTION",
              attr: {
                address,
                chain: coin,
                url: `${API_URL}/api/webhook/tatum`,
              },
            },
            CONFIG
          )
          : null;

        const walletPayload: Wallet = {
          address,
          userId,
          user: userDetail,
          accountId,
          coin,
          isBlocked: false,
          lastDeposit: 0,
          lastWithdrawal: 0,
          network: null,
        };
        const factory = await this.walletFactoryService.create({ ...walletPayload, destinationTag, memo, tatumMessage: message });
        await this.dataServices.wallets.create(factory);
        return;
      }


    } catch (error) {
      Logger.error(error);
    }
  }

  @OnEvent("created.wallet", { async: true })
  async handleWalletCreatedEvent() { }
}
