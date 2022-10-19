
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, now, Document } from "mongoose";
import { P2pOrderType, P2pOrderTypeList } from "src/core/dtos/p2p";
import { Status, STATUS_LIST } from "src/core/types/status";

export type P2pOrderDocument = P2pOrder & Document;

@Schema()
export class P2pOrder {

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true
  })
  merchantId: string;

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true
  })
  clientId: string;

  @Prop({
    type: Types.ObjectId,
    ref: "P2pAds",
    required: true
  })
  adId: string;

  @Prop({
    type: Types.ObjectId,
    ref: "Wallet",
  })
  clientWalletId: string

  @Prop({ enum: P2pOrderTypeList })
  type: P2pOrderType;

  @Prop({ enum: STATUS_LIST })
  status: Status;

  @Prop()
  quantity: number

  @Prop()
  price: number

  @Prop()
  totalAmount: number

  @Prop()
  orderId: string

  @Prop({
    type: Types.ObjectId,
    ref: "P2pAdBank",
    // required: true
  })
  bankId: string

  @Prop()
  clientAccountName: string

  @Prop()
  clientAccountNumber: string

  @Prop()
  clientBankName: string

  @Prop()
  method: string

  @Prop()
  completionTime: Date;

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const P2pOrderSchema = SchemaFactory.createForClass(P2pOrder);



// 4245519