import {
  IsNotEmpty,
  IsString,
  IsNumber
} from "class-validator";
import { CoinType } from "src/lib/constants";
export class BuySellDto {

  @IsNotEmpty()
  @IsNumber()
  amount: number;


  @IsNotEmpty()
  @IsString()
  debitCoin: CoinType

  @IsNotEmpty()
  @IsString()
  creditCoin: CoinType

}

