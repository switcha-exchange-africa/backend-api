import { IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength, MinLength } from "class-validator";

export class WithdrawalCreateDto {
  @IsNotEmpty()
  @IsString()
  public readonly destination: string

  @IsNotEmpty()
  @IsString()
  public readonly coin: string

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  public readonly amount: number

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

export enum IWithdrawalMethod {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic'
}
export type ICreateWithdrawal = WithdrawalCreateDto & {
  userId: string
  email?: string
  // method: IWithdrawalMethod
}