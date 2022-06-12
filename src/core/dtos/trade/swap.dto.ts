import { IsNotEmpty, IsNumber, IsEnum } from "class-validator";

export enum SwapableCoin {
  BTC = 'BTC',
  USDT = 'USDT',
  USDC = 'USDC',
  ETH = 'ETH'
}
export class SwapDto {

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(SwapableCoin)
  sourceCoin: SwapableCoin;

  @IsNotEmpty()
  @IsEnum(SwapableCoin)
  destinationCoin: SwapableCoin;
}
