import { Injectable } from "@nestjs/common";
import { P2pAds } from "src/core/entities/P2pAds";
import { OptionalQuery } from "src/core/types/database";

@Injectable()
export class P2pFactoryService {
  create(data: OptionalQuery<P2pAds>) {
    const ads = new P2pAds();
    if (data.coin) ads.coin = data.coin;
    if (data.cash) ads.cash = data.cash;
    if (data.remark) ads.remark = data.remark;
    if (data.paymentTimeLimit) ads.paymentTimeLimit = data.paymentTimeLimit;
    if (data.reply) ads.reply = data.reply;
    if (data.userId) ads.userId = data.userId;
    if (data.type) ads.type = data.type;
    if (data.priceType) ads.priceType = data.priceType;
    if (data.price) ads.price = data.price;
    if (data.totalAmount) ads.totalAmount = data.totalAmount;
    if (data.minLimit) ads.minLimit = data.minLimit;
    if (data.maxLimit) ads.maxLimit = data.maxLimit;
    if (data.highestPriceOrder) ads.highestPriceOrder = data.highestPriceOrder;
    if (data.counterPartConditions) ads.counterPartConditions = data.counterPartConditions;
    if (data.banks) ads.banks = data.banks;

    
    return ads;
  }
}
