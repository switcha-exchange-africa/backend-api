import { COIN_TYPES } from "src/lib/constants";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class TransferDto {
  @IsNotEmpty()
  @IsString()
  recipientEmail: string;

  @IsNotEmpty()
  @IsString()
  coin: COIN_TYPES;

  @IsNotEmpty()
  @IsString()
  recipientAddress: string;

  @IsNumber()
  amount: number;
}
