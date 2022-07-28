/**
 * type :- buy or sell
 * buyerId:- string
 * sellerId:- string
 * pair:- trading pair
 * price :- price
 * amount :- amount of cryptocurrency to sell
 * status :- filled, partial
 */


import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { QUICK_TRADE_TYPE_LIST, QuickTradeType } from "src/core/entities/QuickTrade";

export type QuickTradeDocument = QuickTrade & Document;


@Schema()
export class QuickTrade {

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true
  })
  buyerId: string;

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true
  })
  sellerId: string;

  @Prop({ enum: QUICK_TRADE_TYPE_LIST })
  type: QuickTradeType;

  @Prop()
  pair: string

  @Prop()
  price: number

  @Prop()
  amount: string;

  @Prop()
  partialFilledDate: Date

  @Prop()
  filledDate: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const QuickTradeSchema = SchemaFactory.createForClass(QuickTrade);

