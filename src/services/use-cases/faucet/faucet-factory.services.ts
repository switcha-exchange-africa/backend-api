import { Injectable } from "@nestjs/common";
import { Faucet } from "src/core/entities/faucet.entity";

@Injectable()
export class FaucetFactoryServices {
  create(data: Faucet) {
    const faucet = new Faucet();

    if (data.amount) faucet.amount = data.amount;
    if (data.coin) faucet.coin = data.coin;
    if (data.description) faucet.description = data.description;

    if (data.userId) faucet.userId = data.userId;
    faucet.balance = data.amount
    faucet.lastDeposit = data.amount
    faucet.createdAt = new Date()
    faucet.updatedAt = new Date()

    return faucet;
  }
}
