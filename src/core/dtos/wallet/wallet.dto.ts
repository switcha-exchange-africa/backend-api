import { UserDetail } from "src/core/entities/user.entity";
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { BLOCKCHAIN_NETWORK, CoinType } from "src/core/entities/wallet.entity";

export class PhraseDto {
  @IsString()
  @IsNotEmpty()
  phrase: string;
}

// deprecated, dont use
export class WalletDto {

  userDetail: UserDetail;

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