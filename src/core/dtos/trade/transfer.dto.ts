import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { CoinType } from "src/core/types/coin";

export class TransferDto {
  @IsNotEmpty()
  @IsString()
  recipientEmail: string;

  @IsNotEmpty()
  @IsString()
  coin: CoinType;

  @IsNotEmpty()
  @IsString()
  recipientAddress: string;

  @IsNumber()
  amount: number;
}
