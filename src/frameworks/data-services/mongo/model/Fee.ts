
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, now, Document } from "mongoose";
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

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const FeeSchema = SchemaFactory.createForClass(Fee);

