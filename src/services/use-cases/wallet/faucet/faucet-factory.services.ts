import { Injectable } from "@nestjs/common";
import { FaucetDto } from "src/core/dtos/wallet/faucet.dto";
import { Faucet } from "src/core/entities/faucet.entity";

@Injectable()
export class FaucetFactoryServices {
  create(data: FaucetDto, userId: string) {
    const faucet = new Faucet();

    if (data.amount) faucet.amount = data.amount;
    if (data.coin) faucet.coin = data.coin;
    if (data.description) faucet.description = data.description;
    if(data.balance)faucet.balance = data.balance
    faucet.userId = userId;
    return faucet;
  }
}
