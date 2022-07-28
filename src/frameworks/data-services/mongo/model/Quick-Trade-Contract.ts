/**
 * Temporary stores
 */


import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { QuickTradeContractStatus, QUICK_TRADE_CONTRACT_LIST } from "src/core/entities/QuickTrade";
export type QuickTradeContractDocument = QuickTradeContract & Document;



@Schema()
export class QuickTradeContract {

  @Prop({
    type: Types.ObjectId,
    ref: "QuickTrade",
    required: true
  })
  quickTradeId: string;

  @Prop()
  price: number;

  @Prop({ enum: QUICK_TRADE_CONTRACT_LIST })
  status: QuickTradeContractStatus;

  @Prop()
  generalTransactionReference: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const QuickTradeContractSchema = SchemaFactory.createForClass(QuickTradeContract);

