import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";

export type ExchangeRateDocument = ExchangeRate & Document;

/**
 * Currency to usd
 */
@Schema()
export class ExchangeRate {

  @Prop()
  coin: string;

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
