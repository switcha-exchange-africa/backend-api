import { Injectable } from "@nestjs/common";
import { Coin } from "src/core/entities/Coin";
import { OptionalQuery } from "src/core/types/database";

@Injectable()
export class CoinFactoryService {
  create(data: OptionalQuery<Coin>) {
    const coin = new Coin();
    if (data.userId) coin.userId = data.userId;
    if (data.coin) coin.coin = data.coin;
    return coin;
  }
}

