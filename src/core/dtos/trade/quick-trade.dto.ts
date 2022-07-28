import { IsEnum, IsNotEmpty, IsNumber, IsPositive } from "class-validator";
import { CoinType } from "src/core/entities/wallet.entity";

export class QuickTradeBuyDto {

  @IsNumber()
  @IsPositive()
  public unitPrice: number


  @IsNumber()
  @IsPositive()
  public amount: number


  @IsNotEmpty()
  @IsEnum(CoinType)
  public buy: CoinType


  @IsNotEmpty()
  @IsEnum(CoinType)
  public payingCoin: CoinType


}



export class QuickTradeSellDto {


  @IsNumber()
  @IsPositive()
  public unitPrice: number


  @IsNumber()
  @IsPositive()
  public amount: number


  @IsNotEmpty()
  @IsEnum(CoinType)
  public sell: CoinType


  @IsNotEmpty()
  @IsEnum(CoinType)
  public acceptingCoin: CoinType


}



export interface IQuickTradeBuy extends QuickTradeBuyDto {
  userId: string
  fullName?: string
}

export interface IQuickTradeSell extends QuickTradeSellDto {
  userId: string
  fullName?: string
}

