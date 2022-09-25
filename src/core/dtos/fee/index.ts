import { PaginationType } from "src/core/types/database";

export enum IFeeAmountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}
export const IAmountTypeEnumList = [
  IFeeAmountType.FIXED,
  IFeeAmountType.PERCENTAGE
]
export type IGetFee = PaginationType & {
  userId: string
  feature: string
  amountType: string
}