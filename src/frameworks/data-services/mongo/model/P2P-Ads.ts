
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, now, Document } from "mongoose";
import { CounterpartConditionsType, P2pAdsList, P2pAdsType, P2pPriceType, P2pPriceTypeList } from "src/core/entities/P2pAds";

export type P2pAdsDocument = P2pAds & Document;

@Schema()
export class P2pAds {
  @Prop()
  coin: string

  @Prop()
  cash: string

  @Prop()
  remark: string

  @Prop({ default: false })
  isPublished: boolean

  @Prop()
  paymentTimeLimit: string

  @Prop()
  reply: string

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true
  })
  userId: string;

  @Prop({ enum: P2pAdsList })
  type: P2pAdsType;


  @Prop({ enum: P2pPriceTypeList })
  priceType: P2pPriceType;

  @Prop()
  price: number

  @Prop()
  totalAmount: number

  @Prop()
  minLimit: number

  @Prop()
  maxLimit: number

  @Prop()
  highestPriceOrder: number

  @Prop({ type: { kyc: Boolean, registeredZeroDaysAgo: Boolean, moreThanDot1Btc: Boolean } })
  counterPartConditions: CounterpartConditionsType

  @Prop({ type: [{ type: Types.ObjectId, ref: 'P2pAdBank' }] })
  banks: string[];


  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const P2pAdsSchema = SchemaFactory.createForClass(P2pAds);



// 4245519