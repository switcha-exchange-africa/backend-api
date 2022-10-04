
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, now, Document } from "mongoose";
import { WithdrawalCryptoDestination, WithdrawalPaymentMethod, WithdrawalStatus, WithdrawalSubType, WithdrawalType, WITHDRAWAL_PAYMENT_METHOD_LIST, WITHDRAWAL_STATUS_LIST, WITHDRAWAL_SUB_TYPE_LIST, WITHDRAWAL_TYPE_LIST } from "src/core/entities/Withdrawal";
import { CoinType, COIN_TYPES_LIST } from "src/core/types/coin";


export type WithdrawalDocument = Withdrawal & Document;

@Schema()
export class Withdrawal {

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true
  })
  userId: string;

  @Prop({
    type: Types.ObjectId,
    ref: "User",
  })
  processedBy: string;

  @Prop({
    type: Types.ObjectId,
    ref: "Transaction",
  })
  transactionId: string;

  @Prop({
    type: Types.ObjectId,
    ref: "Wallet",
    required: true
  })
  walletId: string;

  @Prop({
    type: Types.ObjectId,
    ref: "Bank",
  })
  bankId: string


  @Prop({ type: { address: String, coin: String, tagNumber: String, memo: String } })
  destination : WithdrawalCryptoDestination

  @Prop()
  processedReason: string

  @Prop({ enum: COIN_TYPES_LIST })
  currency: CoinType

  @Prop()
  reference: string

  @Prop({ enum: WITHDRAWAL_TYPE_LIST })
  type: WithdrawalType

  @Prop({ enum: WITHDRAWAL_SUB_TYPE_LIST })
  subType: WithdrawalSubType

  @Prop({ enum: WITHDRAWAL_PAYMENT_METHOD_LIST })
  paymentMethod: WithdrawalPaymentMethod

  @Prop({ enum: WITHDRAWAL_STATUS_LIST })
  status: WithdrawalStatus

  @Prop()
  amount: number

  @Prop()
  originalAmount: number

  @Prop()
  fee: number


  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const WithdrawalSchema = SchemaFactory.createForClass(Withdrawal);



