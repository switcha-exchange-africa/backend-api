import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { BLOCKCHAIN_NETWORK, CoinType } from "src/core/entities/wallet.entity";
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
  coin: string
}