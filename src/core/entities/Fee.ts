
import { IFeeAmountType } from "src/core/dtos/fee";

export class Fee {
  feature: string
  amountInPercentage: number
  amountInFixed: number
  amountType: IFeeAmountType
  userId: string;
}


