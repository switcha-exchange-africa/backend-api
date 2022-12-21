import { PartialType } from "@nestjs/mapped-types"
import { IsNotEmpty, IsOptional, IsString } from "class-validator"
import { Types } from "mongoose"
import { PaginationType } from "src/core/types/database"


export class AddBankDto {

  @IsNotEmpty()
  @IsString()
  public readonly name: string

  @IsNotEmpty()
  @IsString()
  public readonly code: string

  @IsOptional()
  @IsString()
  public readonly branch: string

  @IsNotEmpty()
  @IsString()
  public readonly accountName: string

  @IsNotEmpty()
  @IsString()
  public readonly accountNumber: string
}

export class UpdateBankDto extends PartialType(AddBankDto) {
  
}
export type IUpdateBank = UpdateBankDto & {
  id: Types.ObjectId
  email: string
  userId: string
}
export interface IBank {
  name: string
  code: string
  branch: string
  accountName: string
  accountNumber: string
  userId: string

}

export type IGetBank = PaginationType & {
  userId: string
  name: string
  code: string

}
export type IGetSingleBank = {
  id: Types.ObjectId,
  email: string,
  userId: string
}