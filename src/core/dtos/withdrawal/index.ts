import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

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