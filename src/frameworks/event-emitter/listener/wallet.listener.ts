import { hash } from "src/lib/utils";
import { generateCryptographicSecret } from "./../../../lib/utils";
import { WalletFactoryService } from "src/services/use-cases/wallet/wallet-factory.service";
import { IDataServices } from "src/core/abstracts";
import { IHttpServices } from "src/core/abstracts/http-services.abstract";
import { WalletCreatedEvent } from "./../event/wallet.event";
import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { CRYPTO_API_KEY, WALLET_PRIVATE_KEY } from "src/configuration";
import { WalletDto } from "src/core/dtos/wallet/wallet.dto";
import { UserDetail } from "src/core/entities/user.entity";
import { COIN_TYPES, WALLET_STATUS } from "src/lib/constants";

@Injectable()
export class WalletCreateListener {
  constructor(
    private httpServices: IHttpServices,
    private dataServices: IDataServices,
    private walletFactoryService: WalletFactoryService
  ) {}

  @OnEvent("create.wallet", { async: true })
  async handleWalletCreateEvent(event: WalletCreatedEvent) {
    const { userId, blockchain, network, coin, phrase, symbol } = event;
    const url = `https://api-us-west1.tatum.io/v3/${blockchain}/wallet?type=${network}`;
    const config = {
      headers: {
        "X-API-Key": CRYPTO_API_KEY,
        "x-testnet-type": "ethereum-ropsten",
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
          ? await this.httpServices.get(url, config)
          : {
              mnemonic: "",
              xpub: "",
            };
      const userDetail: UserDetail = {
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
      };
      console.log(response);

      //create new account
      const body = {
        currency: symbol,
        xpub: response.xpub,
        customer: {
          externalId: userId,
        },
        accountingCurrency: "NGN",
      };
      const account =
        coin !== COIN_TYPES.NGN
          ? await this.httpServices.post(
              `https://api-us-west1.tatum.io/v3/ledger/account`,
              body,
              config
            )
          : null;
      console.log(account);

      //verify phrase
      const secretPhrase = await hash(phrase);
      // console.log(secretPhrase)
      const password = `${secretPhrase}${WALLET_PRIVATE_KEY}`;
      const secret =
        response.mnemonic !== ""
          ? await generateCryptographicSecret(password, response.mnemonic)
          : null;
      // create address

      const { address, xpub } = account
        ? await this.httpServices.post(
            `https://api-us-west1.tatum.io/v3/offchain/account/${account.id}/address`,
            {},
            config
          )
        : "";
      const balance = account ? account.balance.availableBalance : 0;
      const accountId = account ? account.id : "";
      const walletPayload: WalletDto = {
        balance,
        address,
        userId,
        user: userDetail,
        phrase: secretPhrase,
        secret,
        xpub,
        accountId,
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
  async handleWalletCreatedEvent() {}
}
