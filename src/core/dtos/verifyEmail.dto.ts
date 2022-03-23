import { IsNotEmpty, IsString } from "class-validator";

export class VerifyUserDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  phrase:string
}