import { Injectable } from "@nestjs/common";
import { Bank } from "src/core/entities/Bank";

@Injectable()
export class BankFactoryService {
  create(data: Bank) {
    const bank = new Bank();
    if (data.userId) bank.userId = data.userId;
    if (data.code) bank.code = data.code;
    if (data.branch) bank.branch = data.branch;
    if (data.accountName) bank.accountName = data.accountName;
    if (data.accountNumber) bank.accountNumber = data.accountNumber;
    if (data.createdAt) bank.createdAt = new Date();
    if (data.updatedAt) bank.updatedAt = new Date();
    return bank;
  }
}
