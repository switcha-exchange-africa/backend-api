import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from "class-validator";

export class KycDto {
  @IsString()
  @IsNotEmpty()
  userType: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  code: string
}


export class UploadIdDto {
  @IsString()
  @IsNotEmpty()
  documentType: string;

  @IsString()
  @IsNotEmpty()
  url: string;

}

export class TxPinDto {

  @IsNotEmpty()
  @IsString()
  @MinLength(6, {
    message: 'Pin is too short',
  })
  @MaxLength(6, {
    message: 'Pin is too long',
  })
  public readonly pin: string;

}

export type ICreateTransactionPin = TxPinDto & {
  userId: string
  email: string
}
export type IUpdateTransactionPin = ICreateTransactionPin & {

  oldPin: string;
}
export class UpdateTxPinDto {

  @IsOptional()
  @IsNotEmpty()
  public readonly pin: string;

  @IsOptional()
  @IsNotEmpty()
  public readonly oldPin: string;

  @IsOptional()
  @IsNotEmpty()
  public readonly code: string;
}

export class UploadAvatarDto {
  @IsString()
  @IsNotEmpty()
  url: string
}

export class CheckTwoFaCodeDto {
  @IsString()
  @IsNotEmpty()
  public readonly code: string
}

export class ChangePasswordDto {

  @IsString()
  @IsOptional()
  public readonly code: string

  @IsString()
  @IsOptional()
  public readonly oldPassword: string


  @IsString()
  @IsOptional()
  public readonly password: string

}


export type ICheckTwoFaCode = CheckTwoFaCodeDto & {
  email: string
  userId: string
}

export type IChangePassword = ChangePasswordDto & {
  email: string
  userId: string
}

export class UpdatePhoneDto {
  @IsNotEmpty()
  @IsString()
  public readonly phone: string
}
export type IUpdatePhone = UpdatePhoneDto & {
  email: string
  userId: string
}
