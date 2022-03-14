import { WALLET_STATUS } from "src/lib/constants";
import { COIN_TYPES } from "src/lib/constants";
import { BLOCKCHAIN_NETWORK } from "src/lib/constants";
import { UserDetail } from "src/core/entities/user.entity";
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class WalletDto {
  @IsNumber()
  @IsNotEmpty()
  balance: number;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  userId: string;

  @IsNotEmpty()
  user: UserDetail;

  @IsOptional()
  @IsNotEmpty()
  network: BLOCKCHAIN_NETWORK;

  @IsNotEmpty()
  coinType: COIN_TYPES;

  @IsOptional()
  status: WALLET_STATUS;

  @IsOptional()
  @IsNumber()
  lastDeposit: number;

  @IsOptional()
  @IsNumber()
  lastWithdrawal: number;

  @IsOptional()
  @IsDate()
  createdAt: Date;

  @IsOptional()
  @IsDate()
  updatedAt: Date;

  @IsOptional()
  @IsBoolean()
  isBlocked: boolean;
}
