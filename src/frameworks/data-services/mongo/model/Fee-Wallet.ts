import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document,now } from "mongoose";
import { BLOCKCHAIN_NETWORK, BLOCKCHAIN_NETWORK_LIST, WALLET_STATUS, WALLET_STATUS_LIST } from "src/core/entities/wallet.entity";
import { CoinType, COIN_TYPES_LIST } from "src/core/types/coin";

export type FeeWalletDocument = FeeWallet & Document;

@Schema({
  timestamps: true

})
export class FeeWallet {
  @Prop({
    default: 0
  })
  balance: number;

  @Prop({
    default: 0
  })
  lockedBalance: number;

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

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
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

export const FeeWalletSchema = SchemaFactory.createForClass(FeeWallet);
