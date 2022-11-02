import { Prop, Schema, SchemaFactory, } from "@nestjs/mongoose";
import { Types, now, Document } from "mongoose";
import { P2pAdsList, P2pAdsType } from "src/core/entities/P2pAds";

export type P2pAdBankDocument = P2pAdBank & Document;

@Schema({
  timestamps: true

})
export class P2pAdBank {
  @Prop()
  name: string

  @Prop()
  code: string

  @Prop()
  accountName: string

  @Prop()
  accountNumber: string

  @Prop({ default: true })
  isActive: boolean

  @Prop()
  isWillingToPayTo: boolean

  @Prop()
  isAcceptingToPaymentTo: boolean
  
  @Prop({ enum: P2pAdsList })
  type: P2pAdsType;

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

export const P2pAdBankSchema = SchemaFactory.createForClass(P2pAdBank);
