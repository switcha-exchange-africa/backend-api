
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { CoinPairList, CryptoPairType } from "src/core/entities/wallet.entity";

export type RateDocument = ExchangeRate & Document;

@Schema()
export class ExchangeRate {

  @Prop({ enum: CoinPairList })
  pair: CryptoPairType;

  @Prop()
  description: string

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true
  })
  userId: string;

  @Prop({ default: 0 })
  buyRate: number

  @Prop({ default: 0 })
  sellRate: number

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ExchangeRateSchema = SchemaFactory.createForClass(ExchangeRate);
