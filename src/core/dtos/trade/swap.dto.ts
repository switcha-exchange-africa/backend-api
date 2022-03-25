import { IsNotEmpty, IsString, IsNumber } from "class-validator";
import { COIN_TYPES } from "src/lib/constants";
export class SwapDto {

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  currency1: COIN_TYPES;

  @IsNotEmpty()
  @IsString()
  currency2: COIN_TYPES;
}
