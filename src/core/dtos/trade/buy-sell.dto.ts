import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsPositive
} from "class-validator";
import { CoinType } from "src/core/types/coin";
export class BuySellDto {

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;


  @IsNotEmpty()
  @IsEnum(CoinType)
  debitCoin: CoinType

  @IsNotEmpty()
  @IsEnum(CoinType)
  creditCoin: CoinType

}

