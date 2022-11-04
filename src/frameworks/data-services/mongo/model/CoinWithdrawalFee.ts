
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";

export type CoinWithdrawalFeeDocument = CoinWithdrawalFee & Document;


@Schema({
  timestamps: true

})
export class CoinWithdrawalFee {
  @Prop()
  coin: string

  @Prop()
  fee: number

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

export const CoinWithdrawalFeeSchema = SchemaFactory.createForClass(CoinWithdrawalFee);

