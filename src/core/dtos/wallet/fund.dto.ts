import {
  IsNotEmpty,
  IsNumber,
} from "class-validator";

export class FundDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  
}
