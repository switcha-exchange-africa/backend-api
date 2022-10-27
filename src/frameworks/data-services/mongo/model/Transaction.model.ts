import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

import { Types, Document } from "mongoose";
import { CUSTOM_TRANSACTION_TYPE, CUSTOM_TRANSACTION_TYPES, Rates, TRANSACTION_STATUS, TRANSACTION_STATUS_LIST, TRANSACTION_SUBTYPE, TRANSACTION_SUBTYPE_LIST, TRANSACTION_TYPE, TRANSACTION_TYPE_LIST } from "src/core/entities/transaction.entity";
import { COIN_TYPES_LIST, CoinType } from "src/core/types/coin";

export type TransactionDocument = Transaction & Document;

@Schema()
export class Transaction {
  @Prop({
    type: Types.ObjectId,
    ref: "User",
  })
  userId: string;

  @Prop({
    type: Types.ObjectId,
    ref: "Wallet",
  })
  walletId: string;

  @Prop({
    type: Types.ObjectId,
    ref: "FeeWallet",
  })
  feeWalletId: string;

  @Prop({
    type: Types.ObjectId,
    ref: "P2pAds",
  })
  p2pAdId: string;

  @Prop({
    type: Types.ObjectId,
    ref: "P2pOrder",
  })
  p2pOrderId: string;

  @Prop({ enum: COIN_TYPES_LIST })
  currency: CoinType;

  @Prop()
  tatumTransactionId: string;

  @Prop()
  reference: string


  @Prop()
  generalTransactionReference: string

  @Prop()
  signedAmount: number;

  @Prop()
  senderAddress: string

  @Prop()
  amount: number;

  @Prop({ enum: TRANSACTION_TYPE_LIST })
  type: TRANSACTION_TYPE;

  @Prop({ enum: TRANSACTION_SUBTYPE_LIST })
  subType: TRANSACTION_SUBTYPE;


  @Prop({ enum: TRANSACTION_STATUS_LIST })
  status: TRANSACTION_STATUS;

  @Prop()
  balanceAfter: number;

  @Prop()
  balanceBefore: number;

  @Prop({
    default: 0
  })
  lockedBalance: number;

  @Prop({ type: Object })
  rate: Rates;

  @Prop({ enum: CUSTOM_TRANSACTION_TYPES })
  customTransactionType: CUSTOM_TRANSACTION_TYPE;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  description: string

  @Prop()
  hash: string

  @Prop({ type: Object })
  metadata: Object
}

const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.index({
  reference: 'text',
  _id: 'text',
  id: 'text',

},
  {
    weights: {
      reference: 5,
      _id: 5,
      id: 5
    },
  },);

export { TransactionSchema }
