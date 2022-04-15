import {
  IsNotEmpty,
  IsOptional,
  IsString
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
  @IsString()
  @IsNotEmpty()
  pin: string;

}

export class UpdateTxPinDto{
  @IsString()
  @IsNotEmpty()
  pin: string;

  @IsString()
  @IsNotEmpty()
  oldPin: string;
}

export class UploadAvatarDto{
  @IsString()
  @IsNotEmpty()
  url: string
}