import {
  IsNotEmpty,
  IsNumber,
  IsEnum
} from "class-validator";
import { CoinType } from "src/lib/constants";
export class BuySellDto {

  @IsNotEmpty()
  @IsNumber()
  amount: number;


  @IsNotEmpty()
  @IsEnum(CoinType)
  debitCoin: CoinType

  @IsNotEmpty()
  @IsEnum(CoinType)
  creditCoin: CoinType

}

