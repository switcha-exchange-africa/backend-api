import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
} from "class-validator";

export class FundDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  
}
