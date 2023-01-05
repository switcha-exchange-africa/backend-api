import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsPositive,
  IsOptional,
  ArrayMinSize,
  IsArray,
  ValidateNested
} from "class-validator";
import { PartialType } from '@nestjs/mapped-types';
import { SwitchaDeviceType } from 'src/lib/constants';
import { Types } from 'mongoose';
import { ActivityAction } from "../activity";
import { Type } from "class-transformer";
import { User } from "src/core/entities/user.entity";

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class WaitListDto {

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsEnum(SwitchaDeviceType)
  device: SwitchaDeviceType
}
export type IWaitList = WaitListDto & {

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

export type ISignup = SignupDto & {
  headers?: Record<string, any>
  ip?: string
}
export type ILogin = LoginDto & {
  headers?: Record<string, any>
  ip?: string
}

export class UpdateUserDto extends PartialType(SignupDto) { }
export class MultpleUserDto extends PartialType(SignupDto) {
  @IsOptional()
  public readonly phone: string
}


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

export class MutateUserAccountDto {
  @IsNotEmpty()
  @IsString()
  public readonly reason: string;

}

export type IMutateUserAccount = MutateUserAccountDto & {
  id: Types.ObjectId
}



export class AddMultipleUsersDto {
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => MultpleUserDto)
  public readonly users: User[]

}
