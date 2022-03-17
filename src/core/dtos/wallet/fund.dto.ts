import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class FundDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
