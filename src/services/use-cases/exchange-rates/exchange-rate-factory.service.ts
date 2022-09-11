import { Injectable } from "@nestjs/common";
import { ExchangeRate } from "src/core/entities/Rate";
import { OptionalQuery } from "src/core/types/database";

@Injectable()
export class ExchangeRateFactoryServices {
  create(data: OptionalQuery<ExchangeRate>) {
    const rate = new ExchangeRate();
    if (data.pair) rate.pair = data.pair;
    if (data.description) rate.description = data.description;
    if (data.userId) rate.userId = data.userId;
    if (data.buyRate) rate.buyRate = data.buyRate;
    if (data.sellRate) rate.sellRate = data.sellRate;
    rate.createdAt = new Date()
    rate.updatedAt = new Date()
    return rate;

  }
}
