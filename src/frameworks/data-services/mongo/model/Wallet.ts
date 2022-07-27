import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { BLOCKCHAIN_NETWORK, BLOCKCHAIN_NETWORK_LIST, CoinType, COIN_TYPES_LIST, WALLET_STATUS, WALLET_STATUS_LIST } from "src/core/entities/wallet.entity";

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


  @Prop()
  accountId: string;

  @Prop({ enum: BLOCKCHAIN_NETWORK_LIST })
  network: BLOCKCHAIN_NETWORK;

  @Prop({ enum: COIN_TYPES_LIST })
  coin: CoinType;

  @Prop({ enum: WALLET_STATUS_LIST })
  status: WALLET_STATUS;

  @Prop({ default: 0 })
  lastDeposit: number;

  @Prop({ default: 0 })
  lastWithdrawal: number;

  @Prop()
  reference: string

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
