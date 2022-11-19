
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";
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

  @Prop({ default: false })
  canBuy: boolean;

  @Prop({ default: false })
  canSell: boolean;

  @Prop({ default: false })
  canWithdraw: boolean;

  @Prop({ default: false })
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

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CoinSchema = SchemaFactory.createForClass(Coin);



// 4245519