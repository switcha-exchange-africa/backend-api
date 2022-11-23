import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { CoinType } from "src/core/types/coin";

export class FaucetDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNotEmpty()
  coin: CoinType;

  @IsOptional()
  description: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  balance: number;

  @IsString()
  @IsOptional()
  
  userId: string;
}

export class CreateFaucetDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNotEmpty()
  coin: CoinType;

  @IsOptional()
  description: string;
}

export class FundFaucetDto {

  @IsNotEmpty()
  coin: CoinType

  @IsNotEmpty()
  walletId: string

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number
}