import { PaginationType } from "src/core/types/database";

export enum IAmountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}
export const IAmountTypeEnumList = [
  IAmountType.FIXED,
  IAmountType.PERCENTAGE
]
export type IGetFee = PaginationType & {
  userId: string
  feature: string
  amountType: string
}