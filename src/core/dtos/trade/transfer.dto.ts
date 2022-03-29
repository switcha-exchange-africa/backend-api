import { COIN_TYPES } from "src/lib/constants";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class TransferDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  coin: COIN_TYPES;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNumber()
  amount: number;
}
