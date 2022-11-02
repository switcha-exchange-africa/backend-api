
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, now, Document } from "mongoose";
import { CoinType, CoinTypeList } from "src/core/entities/Coin";

export type CoinDocument = Coin & Document;

@Schema({
  timestamps: true

})
export class Coin {
  @Prop()
  coin: string

  @Prop({ default: true })
  canSwap: boolean;

  @Prop({ enum: CoinTypeList })
  type: CoinType

  @Prop({ default: true })
  canBuy: boolean;

  @Prop({ default: true })
  canSell: boolean;

  @Prop({ default: true })
  canWithdraw: boolean;

  @Prop({ default: true })
  canP2p: boolean;

  @Prop({ default: true })
  externalDeposit: boolean

  @Prop({ default: true })
  bankTransferDeposit: boolean

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true
  })
  userId: string;

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const CoinSchema = SchemaFactory.createForClass(Coin);



// 4245519