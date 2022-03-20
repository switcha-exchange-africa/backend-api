import { WalletFactoryService } from "src/services/use-cases/wallet/wallet-factory.service";
import { IDataServices } from "src/core/abstracts";
import { IHttpServices } from "src/core/abstracts/http-services.abstract";
import { WalletCreatedEvent } from "./../event/wallet.event";
import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { CRYPTO_API_KEY, CRYPTO_API_WALLET_ID } from "src/configuration";
import { WalletDto } from "src/core/dtos/wallet/wallet.dto";
import { UserDetail } from "src/core/entities/user.entity";
import { COIN_TYPES, WALLET_STATUS } from "src/lib/constants";

@Injectable()
export class WalletCreateListener {
  constructor(
    private httpServices: IHttpServices,
    private dataServices: IDataServices,
    private walletFactoryService: WalletFactoryService
  ) { }

  @OnEvent("create.wallet", { async: true })
  async handleWalletCreateEvent(event: WalletCreatedEvent) {
    const { userId, blockchain, network, coin } = event;
    const label = `switcha-${coin}-userId`;
    const url = `https://rest.cryptoapis.io/v2/wallet-as-a-service/wallets/${CRYPTO_API_WALLET_ID}/${blockchain}/${network}/addresses`;
    const body = {
      context: "",
      data: {
        item: {
          label,
        },
      },
    };
    const config = {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": CRYPTO_API_KEY,
      },
    };
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
      const response =
        coin !== COIN_TYPES.NGN
          ? await this.httpServices.post(url, body, config)
          : {
            item: {
              address: "",
              label,
            },
          };
      const userDetail: UserDetail = {
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
      };

      const walletPayload: WalletDto = {
        balance: 0,
        address: response.item.address,
        userId,
        user: userDetail,
        coin,
        createdAt: new Date(),
        updatedAt: new Date(),
        isBlocked: false,
        lastDeposit: 0,
        lastWithdrawal: 0,
        network: null,
        status: WALLET_STATUS.ACTIVE,
      };
      const factory = await this.walletFactoryService.create(walletPayload);
      await this.dataServices.wallets.create(factory);
      return;
    } catch (error) {
      Logger.error(error);
    }
  }

  @OnEvent("created.wallet", { async: true })
  async handleWalletCreatedEvent() { }
}
