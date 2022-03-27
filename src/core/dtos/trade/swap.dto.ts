import { IsNotEmpty, IsString, IsNumber } from "class-validator";
import { COIN_TYPES } from "src/lib/constants";
export class SwapDto {

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  sourceCoin: COIN_TYPES;

  @IsNotEmpty()
  @IsString()
  destinationCoin: COIN_TYPES;
}
