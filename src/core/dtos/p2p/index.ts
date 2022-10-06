import { PartialType } from "@nestjs/mapped-types";
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
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
  price: number

  @IsNotEmpty()
  @IsNumber()
  totalAmount: number

  @IsNotEmpty()
  @IsNumber()
  minLimit: number

  @IsNotEmpty()
  @IsNumber()
  maxLimit: number

  @IsNotEmpty()
  @IsNumber()
  highestPriceOrder: number


  @IsOptional()
  @IsBoolean()
  kyc: boolean

  @IsOptional()
  @IsBoolean()
  isPublished

  @IsOptional()
  @IsBoolean()
  registeredZeroDaysAgo: boolean


  @IsOptional()
  @IsBoolean()
  moreThanDot1Btc: boolean

  @IsNotEmpty()
  @IsArray()
  banks: string[]

  @IsOptional()
  @IsString()
  reply: string;
}

export type ICreateP2pAd = P2pCreateAdDto & {
  userId: string
}


export type IGetP2pAds = PaginationType & {
  type: string
  userId: string
  coin: string;
  isPublished: boolean
}

export class UpdateP2pCreateAdDto extends PartialType(P2pCreateAdDto) { }
export type IUpdateP2pAds = UpdateP2pCreateAdDto & {
  id: Types.ObjectId
}