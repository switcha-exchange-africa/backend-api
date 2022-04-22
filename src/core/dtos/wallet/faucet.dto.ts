import { CoinType } from "src/lib/constants";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

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