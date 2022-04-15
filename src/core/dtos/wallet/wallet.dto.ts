import { BLOCKCHAIN_NETWORK } from "src/lib/constants";
import { UserDetail } from "src/core/entities/user.entity";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

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
