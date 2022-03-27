import {
  WALLET_STATUS_LIST,
  WALLET_STATUS,
  BLOCKCHAIN_NETWORK,
  BLOCKCHAIN_NETWORK_LIST,
} from "src/lib/constants";
import { UserDetail } from "src/core/entities/user.entity";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export type WalletDocument = Wallet & Document;

@Schema()
export class Wallet {
  @Prop({
    default: 0
  })
  balance: Number;

  @Prop()
  address: string;

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true,
  })
  userId: string;

  @Prop({ type: Object })
  user: UserDetail;

  @Prop()
  accountId: string;

  @Prop({ enum: BLOCKCHAIN_NETWORK_LIST })
  network: BLOCKCHAIN_NETWORK;

  @Prop()
  coin: string;

  @Prop({ enum: WALLET_STATUS_LIST })
  status: WALLET_STATUS;

  @Prop({ default: 0 })
  lastDeposit: number;

  @Prop({ default: 0 })
  lastWithdrawal: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  isBlocked: boolean;


  @Prop()
  destinationTag: string;


  @Prop()
  memo: string;


  @Prop()
  tatumMessage: string;




}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
