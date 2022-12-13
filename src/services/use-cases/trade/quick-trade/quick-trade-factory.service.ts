import { Injectable } from "@nestjs/common";
import { LockedBalance } from "src/core/entities/Locked-Balance";
import { QuickTrade, QuickTradeContract } from "src/core/entities/QuickTrade";
import { OptionalQuery } from "src/core/types/database";
import { Status } from "src/core/types/status";

@Injectable()
export class QuickTradeFactoryService {
  create(data: OptionalQuery<QuickTrade>) {
    const trade = new QuickTrade();
    if (data.buyerId) trade.buyerId = data.buyerId;
    if (data.sellerId) trade.sellerId = data.sellerId;
    if (data.type) trade.type = data.type;
    if (data.pair) trade.pair = data.pair;
    if (data.price) trade.price = data.price;
    if (data.unitPrice) trade.unitPrice = data.unitPrice;
    if (data.amount) trade.amount = data.amount;
    if (data.partialFilledDate) trade.partialFilledDate = data.partialFilledDate;
    if (data.filledDate) trade.filledDate = data.filledDate;
    if (data.status) trade.status = data.status;

    trade.createdAt = new Date();
    trade.updatedAt = new Date();
    return trade;
  }
}



@Injectable()
export class QuickTradeContractFactoryService {
  create(data: OptionalQuery<QuickTradeContract>) {
    const contract = new QuickTradeContract();
    if (data.quickTradeId) contract.quickTradeId = data.quickTradeId;
    if (data.price) contract.price = data.price;
    if (data.status) contract.status = data.status;
    if (data.generalTransactionReference) contract.generalTransactionReference = data.generalTransactionReference;
    contract.createdAt = new Date();
    contract.updatedAt = new Date();
    return contract;
  }
}


@Injectable()
export class LockedBalanceFactoryService {
  create(data: OptionalQuery<LockedBalance>) {
    const locked = new LockedBalance();
    if (data.amount) locked.amount = data.amount;
    if (data.userId) locked.userId = data.userId;
    if (data.walletId) locked.walletId = data.walletId;
    if (data.orderId) locked.orderId = data.orderId;
    if (data.action) locked.action = data.action;
    data.status =  Status.PENDING

    return locked;
  }
}