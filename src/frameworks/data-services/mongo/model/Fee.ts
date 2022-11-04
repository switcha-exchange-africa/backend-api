
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";
import { IFeeAmountType, IAmountTypeEnumList } from "src/core/dtos/fee";

export type FeeDocument = Fee & Document;


@Schema({
  timestamps: true

})
export class Fee {
  @Prop()
  feature: string

  @Prop()
  amountInPercentage: number

  @Prop()
  amountInFixed: number

  @Prop({ enum: IAmountTypeEnumList })
  amountType: IFeeAmountType

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

export const FeeSchema = SchemaFactory.createForClass(Fee);

