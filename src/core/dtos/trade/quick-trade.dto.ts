import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";
import { CoinType } from "src/core/types/coin";

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

export enum QuickTradePaymentMethod {
  BANK = 'bank',
  WALLET = 'wallet'
}

export enum QuickTradeType {
  BUY = 'buy',
  SELL = 'sell'
}


export class QuickTradeBuySellV2Dto {


  @IsNotEmpty()
  @IsNumber()
  amount: number;


  @IsNotEmpty()
  @IsString()
  cash: string

  @IsNotEmpty()
  @IsString()
  coin: string

  @IsNotEmpty()
  @IsEnum(QuickTradePaymentMethod)
  method: QuickTradePaymentMethod
}


export type IQuickTradeBuyV2 = QuickTradeBuySellV2Dto & {
  userId: string
  email: string
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

