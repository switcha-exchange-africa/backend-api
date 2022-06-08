
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { CoinType, COIN_TYPES_LIST } from "src/core/entities/wallet.entity";
import { WithdrawalCryptoDestination, WithdrawalPaymentMethod, WithdrawalStatus, WithdrawalSubType, WithdrawalType, WITHDRAWAL_PAYMENT_METHOD_LIST, WITHDRAWAL_STATUS_LIST, WITHDRAWAL_SUB_TYPE_LIST, WITHDRAWAL_TYPE_LIST } from "src/core/entities/Withdrawal";


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
    ref: "Transaction",
    required: true
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
    required: true
  })
  bankId: string


  @Prop({ type: { address: String, coin: String, tagNumber: String, memo: String } })
  processedBy: WithdrawalCryptoDestination

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


  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const WithdrawalSchema = SchemaFactory.createForClass(Withdrawal);



