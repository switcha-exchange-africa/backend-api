import { Injectable } from "@nestjs/common";
import { DepositAddress } from "src/core/entities/Deposit-Address";
import { OptionalQuery } from "src/core/types/database";

@Injectable()
export class DepositAddressFactoryService {
  create(data: OptionalQuery<DepositAddress>) {
    const address = new DepositAddress();
    if (data.userId) address.userId = data.userId;
    if (data.virtualAccountId) address.virtualAccountId = data.virtualAccountId;
    if (data.coin) address.coin = data.coin;
    if (data.status) address.status = data.status;
    if (data.address) address.address = data.address;
    if (data.derivationKey) address.derivationKey = data.derivationKey;
    if (data.metaData) address.metaData = data.metaData;

    
    return address;
  }
}

