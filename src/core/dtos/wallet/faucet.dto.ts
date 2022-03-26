import { COIN_TYPES } from "src/lib/constants";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class FaucetDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  coin: COIN_TYPES;

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
  coin: COIN_TYPES;

  @IsOptional()
  description: string;
}

export class FundFaucetDto{

  @IsNotEmpty()
  coin: COIN_TYPES

  @IsNotEmpty()
  walletId: string

  @IsNumber()
  @IsNotEmpty()
  amount: number
}