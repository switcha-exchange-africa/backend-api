import { IsEmail, IsEnum, IsNotEmpty } from "class-validator"

export const enum RoleResourcesEnum {
  CRYPTO = 'crypto',
  SEND_MONEY = 'send-money',
  FIAT_WALLET = 'fiat-wallet',
  VIRTUAL_ACCOUNT = 'virtual-account',
  VIRTUAL_CARD = 'virtual-card',
  PHYSICAL_CARD = 'physical-card',
  WITHDRAWAL = 'withdrawal',
  TRANSACTION_PIN = 'transaction-pin',
  SUBSCRIPTION = 'subscription',
  NOTIFICATION = 'notification',
  AIRTIME_DATA = 'airtime-data',
  KYC = 'kyc',
  MISC = 'misc',
  TRANSACTION = 'transaction',
  FEATURE = 'feature',
  FAUCET = 'faucet',
  USER = 'user',
  LIEN = 'lien',
  REFERRAL = 'referral',
  ROLES = 'roles',
  RATE = 'rate'

}
export enum RoleType {
  SUPER_ADMIN = 'super-admin',
  DEVELOPER = 'developer',
  FINANCE = 'finance',
  STAFF = 'staff',
  CUSTOMER_CARE = 'customer-care',
  USER = 'user'
}

export interface RoleDecoratorParams {
  resource: RoleResourcesEnum
  action: 'updateAny' | 'updateOwn' | 'createOwn' | 'createAny' | 'readAny' | 'readOwn' | 'deleteOwn' | 'deleteAny'
}

export class AssignRoleDto {
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @IsNotEmpty()
  @IsEnum(RoleType)
  public role: RoleType;


}

export type IAssignRole = AssignRoleDto
