import { IsNotEmpty, IsString, IsNumber } from "class-validator";
import { CoinType } from "src/lib/constants";
export class SwapDto {

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  sourceCoin: CoinType;

  @IsNotEmpty()
  @IsString()
  destinationCoin: CoinType;
}
