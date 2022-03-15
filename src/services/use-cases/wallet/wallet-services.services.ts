import { DoesNotExistsException } from 'src/services/use-cases/user/exceptions';
import { IDataServices } from "src/core/abstracts";
import { WalletDto } from "src/core/dtos/wallet/wallet.dto";

import { BLOCKCHAIN_NETWORK, NETWORK, WALLET_ID } from "src/lib/constants";
import { COIN_TYPES } from "src/lib/constants";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { HttpException, Injectable, Logger } from "@nestjs/common";

@Injectable()
export class WalletServices {
  constructor(
    private emitter: EventEmitter2,
    private dataServices: IDataServices
  ) {}

  async create(userId: string) {
    const coins = [
      {
        userId: userId,
        blockchain: BLOCKCHAIN_NETWORK.BITCOIN,
        network: NETWORK.TESTNET,
        walletId: WALLET_ID,
        coinType: COIN_TYPES.BTC,
      },
      {
        userId: userId,
        blockchain: BLOCKCHAIN_NETWORK.ETHEREUM,
        network: NETWORK.ROPSTEN,
        walletId: WALLET_ID,
        coinType: COIN_TYPES.USDT,
      },
      {
        userId: userId,
        blockchain: BLOCKCHAIN_NETWORK.ETHEREUM,
        network: NETWORK.ROPSTEN,
        walletId: WALLET_ID,
        coinType: COIN_TYPES.USDC,
      },
      {
        userId: userId,
        blockchain: null,
        network: null,
        walletId: null,
        coinType: COIN_TYPES.NGN,
      },
    ];
    coins.map((coin) => this.emitter.emit("create.wallet", coin));
  }

  async findAll(userId: string) {
    try {
      const wallet = await this.dataServices.wallets.find({ userId: userId });
      if(!wallet)throw DoesNotExistsException
      return wallet;
    } catch (error) {
      if (error.name === 'TypeError') {
        throw new HttpException(error.message, 500)
      }
      Logger.error(error)
      throw error;
    }
  }

  async details(id: string) {
   try {
    const details = await this.dataServices.wallets.findOne({_id: id});
    return details;
   } catch (error) {
    if (error.name === 'TypeError') {
      throw new HttpException(error.message, 500)
    }
    Logger.error(error)
    throw error;
   } 
    
  }

  // async delete(id: string){
  //     try {
  //       await this.dataServices.wallets.
  //     } catch (error) {
        
  //     }
  // }

  // async update(id: string, data: WalletDto){
  //   try {
      
  //   } catch (error) {
      
  //   }
  // }
}
