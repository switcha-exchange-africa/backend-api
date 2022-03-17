import { UserDetail } from "src/core/entities/user.entity";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {
  COIN_TYPES,
  COIN_TYPES_LIST,
  TRANSACTION_TYPE,
  TRANSACTION_TYPE_LIST,
  TRANSACTION_SUBTYPE_LIST,
  CUSTOM_TRANSACTION_TYPE,
  CUSTOM_TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  TRANSACTION_STATUS_LIST,
  TRANSACTION_SUBTYPE,
} from "src/lib/constants";
import { Types } from "mongoose";
import { Rates } from "src/core/entities/transaction.entity";

export type TransactionDocument = Transaction & Document;

@Schema()
export class Transaction {
  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true,
  })
  userId: string;

  @Prop({
    type: Types.ObjectId,
    ref: "Wallet",
    required: true,
  })
  walletId: string;

  @Prop({
    type: Types.ObjectId,
    ref: "TransactionReference",
    required: true,
  })
  txRefId: string;

  @Prop({ enum: COIN_TYPES_LIST })
  currency: COIN_TYPES;

  @Prop()
  signedAmount: number;

  @Prop()
  amount: number;

  @Prop({ enum: TRANSACTION_TYPE_LIST })
  type: TRANSACTION_TYPE;

  @Prop({ enum: TRANSACTION_SUBTYPE_LIST })
  subType: TRANSACTION_SUBTYPE;

  @Prop({ type: Object })
  user: UserDetail;

  @Prop({ enum: TRANSACTION_STATUS_LIST })
  status: TRANSACTION_STATUS;

  @Prop()
  balanceAfter: number;

  @Prop()
  balanceBefore: number;

  @Prop({ type: Object })
  rate: Rates;

  @Prop({ enum: CUSTOM_TRANSACTION_TYPES })
  customTransactionType: CUSTOM_TRANSACTION_TYPE;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
