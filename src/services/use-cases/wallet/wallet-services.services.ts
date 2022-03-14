import { WalletDto } from "src/core/dtos/wallet/wallet.dto";
import { UserDetail } from "src/core/entities/user.entity";
import { WalletFactoryService } from "./wallet-factory.service";
import { DoesNotExistsException } from "src/services/use-cases/user/exceptions";
import { IDataServices } from "src/core/abstracts";
import { CRYPTO_API_KEY } from "src/configuration/index";
import { IHttpServices } from "src/core/abstracts/http-services.abstract";
import { NETWORK, WALLET_ID, WALLET_STATUS } from "src/lib/constants";
import { COIN_TYPES } from "src/lib/constants";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { WALLET_PAYLOAD_TYPE } from "src/frameworks/event-emitter/event/wallet.event";
import { HttpException, Injectable, Logger } from "@nestjs/common";

@Injectable()
export class WalletServices {
  constructor(
    private emitter: EventEmitter2,
    private httpServices: IHttpServices,
    private dataServices: IDataServices,
    private walletFactoryService: WalletFactoryService
  ) {}

  async eventCreateWallet(eventPayload: WALLET_PAYLOAD_TYPE) {
    const { userId, blockchain, network, walletId } = eventPayload;
    const url = `https://rest.cryptoapis.io/v2/wallet-as-a-service/wallets/${walletId}/${blockchain}/${network}/addresses`;
    const body = {
      context: "",
      data: {
        item: {
          label: blockchain,
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
      const response = await this.httpServices.post(url, body, config);
      const user = await this.dataServices.users.findOne({ _id: userId });
      if (!user) throw new DoesNotExistsException("user does not exists");
      const payload = {
        userId,
        user,
        ...response,
        ...eventPayload,
      };
      await this.emitter.emit("created.wallet", payload);
    } catch (error) {
      Logger.error(error);
    }
  }

  async createWallet(userId: string) {
    const payload: WALLET_PAYLOAD_TYPE = {
      userId: userId,
      blockchain: COIN_TYPES.BTC,
      network: NETWORK.TESTNET,
      walletId: WALLET_ID,
    };
    this.emitter.emit("create.wallet", payload);
  }

  async findAllUserWallets(userId: string) {}

  async findWalletDetails(walletId: string) {
    return walletId;
  }
  async addWalletToDB(payload) {
    try {
      const { userId, user, item, blockchain, network, walletId } = payload;

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
        createdAt: item.createdTimeStamp,
        updatedAt: item.createdTimeStamp,
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
    } catch (error) {
      Logger.error(error);
    }
  }
}
