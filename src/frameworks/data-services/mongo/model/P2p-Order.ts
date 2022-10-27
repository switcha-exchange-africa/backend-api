
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
const P2pOrderSchema = SchemaFactory.createForClass(P2pOrder);


P2pOrderSchema.virtual('client', {
  ref: 'User',
  localField: 'clientId',
  foreignField: '_id',
});
P2pOrderSchema.virtual('wallet', {
  ref: 'Wallet',
  localField: 'clientWalletId',
  foreignField: '_id',
});
P2pOrderSchema.virtual('merchant', {
  ref: 'User',
  localField: 'merchantId',
  foreignField: '_id'
});

P2pOrderSchema.virtual('bank', {
  ref: 'P2pAdBank',
  localField: 'bankId',
  foreignField: '_id'
});

P2pOrderSchema.virtual('ad', {
  ref: 'P2pAds',
  localField: 'adId',
  foreignField: '_id'
});
P2pOrderSchema.pre<P2pOrderDocument>(/^find/, function (next) {
  this.populate({
    path: 'client',
    options: { select: 'email firstName lastName level lock isBlacklisted username isSwitchaMerchant avatar noOfP2pOrderCompleted noOfP2pOrderCreated' } // <-- wrap `select` in `options` here...
  })

  next();
});
P2pOrderSchema.pre<P2pOrderDocument>(/^find/, function (next) {
  this.populate({
    path: 'merchant',
    options: { select: 'email firstName lastName level lock isBlacklisted username isSwitchaMerchant avatar noOfP2pOrderCompleted noOfP2pOrderCreated' } // <-- wrap `select` in `options` here...
  })

  next();
});

P2pOrderSchema.index({
  orderId: 'text',
  _id: 'text',

},
  {
    weights: {
      orderId: 5,
      _id: 5,

    },
  },);
export { P2pOrderSchema }

