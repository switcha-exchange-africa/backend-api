import { AlreadyExistsException } from "src/services/use-cases/user/exceptions";
import { WalletFactoryService } from "src/services/use-cases/wallet/wallet-factory.service";
import { IDataServices } from "src/core/abstracts";
import { IHttpServices } from "src/core/abstracts/http-services.abstract";
import {
  WalletCreatedEvent,
} from "./../event/wallet.event";
import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { CRYPTO_API_KEY } from "src/configuration";
import { DoesNotExistsException } from "src/services/use-cases/user/exceptions";
import { WalletDto } from "src/core/dtos/wallet/wallet.dto";
import { UserDetail } from "src/core/entities/user.entity";
import { COIN_TYPES, WALLET_STATUS } from "src/lib/constants";

@Injectable()
export class WalletCreateListener {
  constructor(
    private httpServices: IHttpServices,
    private dataServices: IDataServices,
    private emitter: EventEmitter2,
    private walletFactoryService: WalletFactoryService
  ) {}
  @OnEvent("create.wallet", { async: true })
  async handleWalletCreateEvent(event: WalletCreatedEvent) {
    console.log("-------event works ----------");
    console.log(event);
    const { userId, blockchain, network, walletId, coinType } = event;
    const url = `https://rest.cryptoapis.io/v2/wallet-as-a-service/wallets/${walletId}/${blockchain}/${network}/addresses`;
    const body = {
      context: "",
      data: {
        item: {
          label: coinType,
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
      const wallet = await this.dataServices.wallets.find({
        userId: userId,
        coinType: coinType,
      });
      if (wallet.length !== 0)
        throw new AlreadyExistsException("wallet already exists");
      let response;
      if (coinType !== COIN_TYPES.NGN) {
        response = await this.httpServices.post(url, body, config);
      } else {
        response = {
          item: {
            address: "",
            createdTimestamp: new Date(),
            label: coinType,
          },
        };
      }
      const user = await this.dataServices.users.findOne({ _id: userId });
      if (!user) throw new DoesNotExistsException("user does not exists");
      const payload = {
        userId,
        user,
        ...response,
        ...event,
      };
      await this.emitter.emit("created.wallet", payload);
    } catch (error) {
      Logger.error(error);
    }
  }

  @OnEvent("created.wallet", { async: true })
  async handleWalletCreatedEvent(payload) {
    console.log("-------event works ----------");
    const { userId, user, item, blockchain, network, walletId } = payload;
    console.log(item);
    const userDetail: UserDetail = {
      email: user.email,
      fullName: user.firstName + " " + user.lastName,
    };

    const walletPayload: WalletDto = {
      balance: 0,
      address: item.address,
      userId,
      user: userDetail,
      coinType: item.label,
      createdAt: item.createdTimestamp,
      updatedAt: item.createdTimestamp,
      isBlocked: false,
      lastDeposit: 0,
      lastWithdrawal: 0,
      network: null,
      status: WALLET_STATUS.ACTIVE,
    };
    const wallet = await this.walletFactoryService.createNewWallet(
      walletPayload
    );
    await this.dataServices.wallets.create(wallet);
  }
}
