import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsEnum, IsPositive } from "class-validator";

export enum SwapableCoin {
  BTC = 'BTC',
  USDT = 'USDT',
  USDC = 'USDC',
  ETH = 'ETH',
  USDT_TRON = 'USDT_TRON',
  BUSD = 'BUSD',
  BNB = 'BNB'
}
export class SwapDto {

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNotEmpty()
  @IsEnum(SwapableCoin)
  sourceCoin: SwapableCoin;

  @IsNotEmpty()
  @IsEnum(SwapableCoin)
  destinationCoin: SwapableCoin;
}


export type ICreateSwap = SwapDto & {
  userId: string
  email: string
}
export class SwapV2Dto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsPositive()
  amount: number;

  @IsNotEmpty()
  @IsEnum(SwapableCoin)
  source: SwapableCoin;

  @IsNotEmpty()
  @IsEnum(SwapableCoin)
  destination: SwapableCoin;
}

export type ISwapV2 = SwapV2Dto & {}