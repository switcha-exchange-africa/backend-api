import {
  COIN_TYPES,
  WALLET_STATUS_LIST,
  WALLET_STATUS,
  BLOCKCHAIN_NETWORK,
  BLOCKCHAIN_NETWORK_LIST,
  COIN_TYPES_LIST,
} from "src/lib/constants";
import { UserDetail } from "src/core/entities/user.entity";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type WalletDocument = Wallet & Document;

export class Wallet {
  @Prop()
  balance: number;

  @Prop()
  userId: string;

  @Prop({ type: Object })
  user: UserDetail;

  @Prop({ enum: BLOCKCHAIN_NETWORK_LIST })
  network: BLOCKCHAIN_NETWORK;

  @Prop({ enum: COIN_TYPES_LIST })
  coinType: COIN_TYPES;

  @Prop({ enum: WALLET_STATUS_LIST })
  status: WALLET_STATUS;

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
