import {
  CoinType,
  COIN_TYPES_LIST,
} from "src/lib/constants";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export type FaucetDocument = Faucet & Document;

@Schema()
export class Faucet {
  @Prop()
  amount: number;

  @Prop({ enum: COIN_TYPES_LIST })
  coin: CoinType;

  @Prop()
  description: string

  @Prop({ default: 0 })
  balance: number

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true
  })
  userId: string;

  @Prop({ default: 0 })
  lastDeposit: number;

  @Prop({ default: 0 })
  lastWithdrawal: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const FaucetSchema = SchemaFactory.createForClass(Faucet);
