import { Injectable } from "@nestjs/common";
import { P2pAds } from "src/core/entities/P2pAds";
import { P2pAdBank } from "src/core/entities/P2pAdsBank";
import { P2pOrder } from "src/core/entities/P2pOrder";
import { OptionalQuery } from "src/core/types/database";
import { randomFixedInteger } from "src/lib/utils";

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
    if (data.isSwitchaMerchant) ads.isSwitchaMerchant = data.isSwitchaMerchant;
    if (data.isPublished) ads.isPublished = data.isPublished;

    
    return ads;
  }
}

@Injectable()
export class P2pAdBankFactoryService {
  create(data: OptionalQuery<P2pAdBank>) {
    const bank = new P2pAdBank();
    if (data.name) bank.name = data.name;
    if (data.code) bank.code = data.code;
    if (data.accountName) bank.accountName = data.accountName;
    if (data.accountNumber) bank.accountNumber = data.accountNumber;
    if (data.isActive) bank.isActive = data.isActive;
    if (data.isWillingToPayTo) bank.isWillingToPayTo = data.isWillingToPayTo;
    if (data.isAcceptingToPaymentTo) bank.isAcceptingToPaymentTo = data.isAcceptingToPaymentTo;
    if (data.userId) bank.userId = data.userId;
    if (data.type) bank.type = data.type;

    return bank;
  }
}


@Injectable()
export class P2pOrderFactoryService {
  create(data: OptionalQuery<P2pOrder>) {
    const order = new P2pOrder();
    if (data.merchantId) order.merchantId = data.merchantId;
    if (data.clientId) order.clientId = data.clientId;
    if (data.adId) order.adId = data.adId;
    if (data.type) order.type = data.type;
    if (data.status) order.status = data.status;
    if (data.quantity) order.quantity = data.quantity;
    if (data.price) order.price = data.price;
    if (data.totalAmount) order.totalAmount = data.totalAmount;
    if (data.bankId) order.bankId = data.bankId;
    if (data.clientAccountName) order.clientAccountName = data.clientAccountName;
    if (data.clientAccountNumber) order.clientAccountNumber = data.clientAccountNumber;
    if (data.clientBankName) order.clientAccountName = data.clientAccountName;
    if (data.clientWalletId) order.clientWalletId = data.clientWalletId;
    if (data.method) order.method = data.method;
    if (data.coin) order.coin = data.coin;
    if (data.cash) order.cash = data.cash;


    
    order.orderId = String(randomFixedInteger(12))
    return order;
  }
}





