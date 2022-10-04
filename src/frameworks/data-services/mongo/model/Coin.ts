
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, now, Document } from "mongoose";

export type CoinDocument = Coin & Document;

@Schema()
export class Coin {
  @Prop()
  coin: string


  @Prop({ default: true })
  canSwap: boolean;


  @Prop({ default: true })
  canBuy: boolean;

  @Prop({ default: true })
  canSell: boolean;

  @Prop({ default: true })
  canP2p: boolean;

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