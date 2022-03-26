import { BLOCKCHAIN_NETWORK } from "src/lib/constants";
import { UserDetail } from "src/core/entities/user.entity";
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class PhraseDto{
  @IsString()
  @IsNotEmpty()
  phrase: string;
}

export class WalletDto {
  @IsNumber()
  @IsNotEmpty()
  balance: Number;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  userId: string;

  @IsNotEmpty()
  user: UserDetail;

  @IsString()
  phrase: string;

  @IsNotEmpty()
  secret: string;

  @IsString()
  xpub: string;

  @IsString()
  accountId:string;

  @IsOptional()
  @IsNotEmpty()
  network: BLOCKCHAIN_NETWORK;

  @IsNotEmpty()
  coin: string;


  @IsOptional()
  @IsNumber()
  lastDeposit: number;

  @IsOptional()
  @IsNumber()
  lastWithdrawal: number;

  @IsOptional()
  @IsBoolean()
  isBlocked: boolean;
}
