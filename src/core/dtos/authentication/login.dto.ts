import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsPositive
} from "class-validator";
import { PartialType } from '@nestjs/mapped-types';
import { SwitchaDeviceType } from 'src/lib/constants';
import { Types } from 'mongoose';
import { ActivityAction } from "../activity";
import { Type } from "class-transformer";

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

  @IsString()
  @IsNotEmpty()
  username: string


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


export class FindByFeatureDto {
  @IsNotEmpty()
  @IsString()
  public feature: string;

}


export class CalculateTradeFeeDto {
  @IsNotEmpty()
  @IsEnum(ActivityAction)
  public operation: ActivityAction;


  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  public amount: number;

}


export class CalculateWithdrawalFeeDto {
  @IsNotEmpty()
  @IsString()
  public coin: string;


  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  public amount: number;

}