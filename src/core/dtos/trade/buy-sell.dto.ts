import {
  IsNotEmpty,
  IsNumber,
  IsEnum
} from "class-validator";
import { CoinType } from "src/core/entities/wallet.entity";
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

