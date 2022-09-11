import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsBoolean
} from "class-validator";
import { PartialType } from '@nestjs/mapped-types';
import { SwitchaDeviceType } from 'src/lib/constants';
import { Types } from 'mongoose';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class SignupDto {

  @IsString()
  @IsNotEmpty()
  firstName: string

  @IsString()
  @IsNotEmpty()
  lastName: string


  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsEnum(SwitchaDeviceType)
  device: SwitchaDeviceType

  @IsString()
  password: string

  @IsBoolean()
  agreedToTerms: boolean

}

export type ISignup = SignupDto & {}
export type ILogin = LoginDto & {}

export class UpdateUserDto extends PartialType(SignupDto) { }



export class FindByIdDto {
  @IsNotEmpty()
  @IsString()
  public id: Types.ObjectId;

}