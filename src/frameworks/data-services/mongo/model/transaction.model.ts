import { UserDetail } from "src/core/entities/user.entity";
import {
  SWITCHATYPES,
  SwitchaTypeTransaction,
  TRANSACTION_STATUS,
  TRANSACTION_STATUS_LIST,
  TRANSACTION_SUBTYPE,
} from "src/lib/constants";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import {
  COIN_TYPES,
  COIN_TYPES_LIST,
  TRANSACTION_TYPE,
  TRANSACTION_TYPE_LIST,
  TRANSACTION_SUBTYPE_LIST,
} from "src/lib/constants";

export type TransactionDocument = Transaction & Document;

@Schema()
export class Transaction {
  @Prop()
  userId: string;

  @Prop()
  walletId: string;

  @Prop()
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

  @Prop()
  rate: number;

  @Prop({ enum: SWITCHATYPES })
  switchaTypeTransaction: SwitchaTypeTransaction;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
