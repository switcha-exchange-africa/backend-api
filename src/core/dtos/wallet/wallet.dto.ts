import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from "class-validator";
import { Types } from "mongoose";
import { BLOCKCHAIN_NETWORK } from "src/core/entities/wallet.entity";
import { CoinType } from "src/core/types/coin";
import { PaginationType } from "src/core/types/database";

export class PhraseDto {
  @IsString()
  @IsNotEmpty()
  phrase: string;
}

// deprecated, dont use
export class WalletDto {


  @IsString()
  accountId: string;

  @IsOptional()
  chain: BLOCKCHAIN_NETWORK;

  @IsNotEmpty()
  coin: string;
}

export class CreateWalletDto {

  @IsNotEmpty()
  @IsEnum(CoinType)
  coin: CoinType
}

export type IGetWallets = PaginationType & {
  userId: string
  email?: string
  fullName?: string
  coin: string
  reference: string
  isAdmin?: boolean
}
export class FundWalletDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  public readonly amount: number

  @IsNotEmpty()
  @IsString()
  public readonly coin: string

}
export type IFundWallet = FundWalletDto & {
  walletId: Types.ObjectId,


}