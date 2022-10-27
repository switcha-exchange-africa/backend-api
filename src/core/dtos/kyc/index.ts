import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";
import { PaginationType } from "src/core/types/database";
import { Status } from "src/core/types/status";



export class AddKycLevelTwoDto {

  @IsNotEmpty()
  @IsString()
  public readonly image: string

}


export class AddKycLevelThreeDto {

  @IsNotEmpty()
  @IsString()
  public readonly selfie: string

}



export class ProcessKycDtoDto {

  @IsNotEmpty()
  @IsEnum(Status)
  public readonly status: Status

  @IsOptional()
  @IsString()
  public readonly reason: Status

}
export type IProcessKyc = ProcessKycDtoDto & {
  adminId: string
  adminEmail: string
  id: Types.ObjectId
}

export type IGetKyc = PaginationType & {
  userId: string,
  status: string,
  level: string
}

export type IKyc = AddKycLevelThreeDto & AddKycLevelTwoDto & {
  userId: string
}

export type IKycLevelTwo = AddKycLevelTwoDto & {
  email: string
  userId: string
}

export type IKycLevelThree = AddKycLevelThreeDto & {
  email: string
  userId: string
}