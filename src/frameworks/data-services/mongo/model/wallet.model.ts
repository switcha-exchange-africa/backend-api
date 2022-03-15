import {
  WALLET_STATUS_LIST,
  WALLET_STATUS,
  BLOCKCHAIN_NETWORK,
  BLOCKCHAIN_NETWORK_LIST,
} from "src/lib/constants";
import { UserDetail } from "src/core/entities/user.entity";

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type WalletDocument = Wallet & Document;

@Schema()
export class Wallet {
  @Prop()
  balance: number;

  @Prop()
  address: string;

  @Prop()
  userId: string;

  @Prop({ type: Object })
  user: UserDetail;

  @Prop({ enum: BLOCKCHAIN_NETWORK_LIST })
  network: BLOCKCHAIN_NETWORK;

  @Prop()
  coin: string;

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
