import { IsNotEmpty, IsOptional, IsString } from "class-validator"


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


export interface IBank {
  name: string
  code: string
  branch: string
  accountName: string
  accountNumber: string
  userId: string

}