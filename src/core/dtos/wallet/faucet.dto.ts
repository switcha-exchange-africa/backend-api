import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { CoinType } from "src/core/types/coin";

export class FaucetDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  coin: CoinType;

  @IsOptional()
  description: string;

  @IsOptional()
  @IsNumber()
  balance: number;

  @IsString()
  @IsOptional()
  userId: string;
}

export class CreateFaucetDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  coin: CoinType;

  @IsOptional()
  description: string;
}

export class FundFaucetDto{

  @IsNotEmpty()
  coin: CoinType

  @IsNotEmpty()
  walletId: string

  @IsNumber()
  @IsNotEmpty()
  amount: number
}