import { COIN_TYPES, TRANSACTION_TYPE } from "src/lib/constants";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class FaucetDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNotEmpty()
  coin: COIN_TYPES;

  @IsOptional()
  description: string;

  @IsNumber()
  balance: number;

  @IsString()
  @IsOptional()
  userId: string;
}
