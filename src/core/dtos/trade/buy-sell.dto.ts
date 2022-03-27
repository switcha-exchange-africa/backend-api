import {
  IsNotEmpty,
  IsString,
  IsNumber
} from "class-validator";
import { COIN_TYPES } from "src/lib/constants";
export class BuySellDto {

  @IsNotEmpty()
  @IsNumber()
  amount: number;


  @IsNotEmpty()
  @IsString()
  debitCoin: COIN_TYPES

  @IsNotEmpty()
  @IsString()
  creditCoin: COIN_TYPES

}

