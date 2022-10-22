import { Injectable } from "@nestjs/common";
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
