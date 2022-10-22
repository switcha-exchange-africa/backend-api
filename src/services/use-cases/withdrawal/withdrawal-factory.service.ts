import { Injectable } from "@nestjs/common";
import { OptionalQuery } from "src/core/types/database";
import { Withdrawal } from "src/core/entities/Withdrawal";

@Injectable()
export class WithdrawalFactoryService {
  create(data: OptionalQuery<Withdrawal>) {
    const withdrawal = new Withdrawal();
    if (data.userId) withdrawal.userId = data.userId;
    if (data.processedBy) withdrawal.processedBy = data.processedBy;
    if (data.transactionId) withdrawal.transactionId = data.transactionId;
    if (data.walletId) withdrawal.walletId = data.walletId;
    if (data.bankId) withdrawal.bankId = data.bankId;
    if (data.destination) withdrawal.destination = data.destination;
    if (data.processedReason) withdrawal.processedReason = data.processedReason;
    if (data.currency) withdrawal.currency = data.currency;
    if (data.reference) withdrawal.reference = data.reference;
    if (data.type) withdrawal.type = data.type;
    if (data.subType) withdrawal.subType = data.subType;
    if (data.paymentMethod) withdrawal.paymentMethod = data.paymentMethod;
    if (data.status) withdrawal.status = data.status;
    if (data.amount) withdrawal.amount = data.amount;
    if (data.originalAmount) withdrawal.originalAmount = data.originalAmount;
    if (data.fee) withdrawal.fee = data.fee;
    return withdrawal;
  }
}
