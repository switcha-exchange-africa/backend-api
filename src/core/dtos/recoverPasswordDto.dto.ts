import {
  IsEmail,
  IsOptional,
  IsString
} from "class-validator";

export class RecoverPasswordDto {
  @IsString()
  @IsOptional()
  code: string;

  @IsEmail()
  email: string;
}