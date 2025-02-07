import { PartialType } from "@nestjs/mapped-types";
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { Types } from "mongoose";
import { P2pAdsType, P2pPriceType } from "src/core/entities/P2pAds";
import { PaginationType } from "src/core/types/database";

export class P2pCreateAdDto {

  @IsNotEmpty()
  @IsString()
  coin: string;

  @IsNotEmpty()
  @IsString()
  cash: string

  @IsNotEmpty()
  @IsString()
  remark: string;

  @IsNotEmpty()
  @IsString()
  paymentTimeLimit: string;

  @IsNotEmpty()
  @IsEnum(P2pPriceType)
  priceType: P2pPriceType;

  @IsNotEmpty()
  @IsEnum(P2pAdsType)
  type: P2pAdsType;


  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  totalAmount: number

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  minLimit: number

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  maxLimit: number

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  highestPriceOrder: number


  @IsOptional()
  @IsBoolean()
  kyc: boolean

  @IsOptional()
  @IsBoolean()
  isPublished: boolean

  @IsOptional()
  @IsBoolean()
  isOnline: boolean

  @IsOptional()
  @IsBoolean()
  registeredZeroDaysAgo: boolean


  @IsOptional()
  @IsBoolean()
  moreThanDot1Btc: boolean

  @IsOptional()
  @IsArray()
  banks: string[]

  @IsOptional()
  @IsString()
  reply: string;
}

export enum P2pOrderType {
  BUY = 'buy',
  SELL = 'sell'
}
export const P2pOrderTypeList = [
  P2pOrderType.BUY,
  P2pOrderType.SELL,

]
export class P2pCreateOrderDto {
  @IsNotEmpty()
  @IsString()
  adId: string

  @IsOptional()
  @IsString()
  bankId: string

  @IsOptional()
  @IsString()
  clientAccountName: string

  @IsOptional()
  @IsString()
  clientAccountNumber: string

  @IsOptional()
  @IsString()
  clientBankName: string

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  quantity: number


  @IsNotEmpty()
  @IsEnum(P2pOrderType)
  type: P2pOrderType

}
export type ICreateP2pOrder = P2pCreateOrderDto & {
  merchantId?: string
  clientId: string
  email: string
  firstName: string
  lastName: string
}
export class P2pAdCreateBankDto {

  @IsOptional()
  @IsString()
  name: string


  @IsOptional()
  @IsString()
  code: string

  @IsNotEmpty()
  @IsEnum(P2pAdsType)
  type: P2pAdsType;

  @IsOptional()
  @IsString()
  accountName: string

  @IsOptional()
  @IsString()
  accountNumber: string


  @IsOptional()
  @IsBoolean()
  isActive: boolean

  @IsOptional()
  @IsBoolean()
  isWillingToPayTo: boolean

  @IsOptional()
  @IsBoolean()
  isAcceptingToPaymentTo: boolean

}

export class P2pAdEditBankDto extends PartialType(P2pAdCreateBankDto) { }
export type IUpdateP2pAdBank = P2pAdEditBankDto & {
  email: string
  userId: string
  id: Types.ObjectId
}

export type ICreateP2pAd = P2pCreateAdDto & {
  userId: string
  email: string
}


export type IGetP2pAds = PaginationType & {
  type: string
  userId: string
  coin: string;
  isPublished: boolean
  isSwitchaMerchant: boolean
  email?: string
  status: string
  paymentTimeLimit: string
  cash: string

}

export type IGetP2pBanks = PaginationType & {
  accountNumber: string
  isActive: boolean
  isWillingToPayTo: boolean
  isAcceptingToPaymentTo: boolean
  userId: string;
  type: P2pAdsType;

}
export class UpdateP2pCreateAdDto extends PartialType(P2pCreateAdDto) { }
export type IUpdateP2pAds = UpdateP2pCreateAdDto & {
  id: Types.ObjectId
  userId: string
  email: string
}

export type ICreateP2pAdBank = P2pAdCreateBankDto & {
  userId: string;

}

export type IGetP2pAdBank = PaginationType & {
  userId: string
  isActive: boolean
  isAcceptingToPaymentTo: boolean
  isWillingToPayTo: boolean
  type: string

}
export class P2pConfirmOrderDto {
  @IsOptional()
  @IsString()
  public readonly code: string
}
export type IP2pConfirmOrder = P2pConfirmOrderDto & {
  userId: string
  email?: string
  orderId: Types.ObjectId
}
export type IP2pConfirmOrderAdmin = {
  orderId: Types.ObjectId
  processedByAdminId: string
}
export type IGetP2pOrders = PaginationType & {
  merchantId?: string;
  clientId?: string;
  adId: string;
  clientWalletId: string
  type: string;
  status: string;
  orderId: string
  bankId: string
  method: string
  email?: string
  coin: string
  cash: string
  orderType: string
}



export class FindByOrderIdDto {
  @IsNotEmpty()
  @IsString()
  public orderId: string;

}

export type IGetOrderByOrderId = {
  orderId: string
  email: string
  userId: string
}

export type IP2pNotifyMerchant = {
  orderId: Types.ObjectId
  userId: string
  email: string
  fullName: string
  username: string
}