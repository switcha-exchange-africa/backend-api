

import {
  IsEmail,
  IsNotEmpty,
  IsString
} from "class-validator";

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsEmail()
  email: string;
}


export class ResetPasswordBodyDto{
  @IsString()
  @IsNotEmpty()
  password: string;

}
