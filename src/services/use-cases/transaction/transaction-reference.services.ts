import { Injectable } from "@nestjs/common";
import { TransactionReference } from "src/core/entities/transaction-reference.entity";
import { generateTXHash } from "src/lib/utils";

@Injectable()
export class TransactionReferenceFactoryService {
  create(data: TransactionReference) {
    const transaction = new TransactionReference();
    if (data.userId) transaction.userId = data.userId;
    if (data.amount) transaction.amount = data.amount;
    transaction.hash = generateTXHash();
    transaction.createdAt = new Date();
    transaction.updatedAt = new Date();
    return transaction;
  }
}
