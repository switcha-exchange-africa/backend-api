import {
  COIN_TYPES,
  COIN_TYPES_LIST,
  TRANSACTION_TYPE,
  TRANSACTION_TYPE_LIST,
} from "src/lib/constants";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export type FaucetDocument = Faucet & Document;

@Schema()
export class Faucet {
  @Prop()
  amount: number;

  @Prop({ enum: COIN_TYPES_LIST })
  coin: COIN_TYPES;

  @Prop()
  description: string

  @Prop()
  balance: number

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true
  })
  userId: string;

}

export const FaucetSchema = SchemaFactory.createForClass(Faucet);
