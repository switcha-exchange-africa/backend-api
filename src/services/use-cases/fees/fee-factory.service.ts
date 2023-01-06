import { Injectable } from "@nestjs/common";
import { BlockchainFeesAccrued } from "src/core/entities/BlockchainFeesAccured";
import { Fee } from "src/core/entities/Fee";
import { OptionalQuery } from "src/core/types/database";

@Injectable()
export class FeeFactoryServices {
  create(data: OptionalQuery<Fee>) {
    const fee = new Fee();
    if (data.feature) fee.feature = data.feature;
    if (data.amountInPercentage) fee.amountInPercentage = data.amountInPercentage;
    if (data.userId) fee.userId = data.userId;
    if (data.amountInFixed) fee.amountInFixed = data.amountInFixed;
    if (data.amountType) fee.amountType = data.amountType;
    return fee;

  }
}




@Injectable()
export class BlockchainFeesAccruedFactoryServices {
  create(data: OptionalQuery<BlockchainFeesAccrued>) {
    const fee = new BlockchainFeesAccrued();
    if (data.action) fee.action = data.action;
    if (data.coin) fee.coin = data.coin;
    if (data.fee) fee.fee = data.fee;
    if (data.description) fee.description = data.description;
    if (data.userId) fee.userId = data.userId;
    if (data.walletId) fee.walletId = data.walletId;

    return fee;

  }
}

