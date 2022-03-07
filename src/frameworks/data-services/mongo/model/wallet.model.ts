import {
  COIN_TYPES,
  WALLET_STATUS_LIST,
  WALLET_STATUS,
  WALLET_NETWORK,
  WALLET_NETWORK_LIST,
  COIN_TYPES_LIST,
  UserWalletInformation,
} from "./../../../../lib/constants";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type WalletDocument = Wallet & Document;

export class Wallet {
  @Prop()
  balance: number;

  @Prop()
  userId: string;

  @Prop({ type: Object })
  user: UserWalletInformation;

  @Prop({ enum: WALLET_NETWORK_LIST })
  walletNetwork: WALLET_NETWORK;

  @Prop({ enum: COIN_TYPES_LIST })
  coinType: COIN_TYPES;

  @Prop({ enum: WALLET_STATUS_LIST })
  walletStatus: WALLET_STATUS;

  @Prop()
  lastDeposit: number;

  @Prop()
  lastWithdrawal: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  isBlocked: boolean;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
