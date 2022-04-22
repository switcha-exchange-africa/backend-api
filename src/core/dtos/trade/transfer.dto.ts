import { CoinType } from "src/lib/constants";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

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
