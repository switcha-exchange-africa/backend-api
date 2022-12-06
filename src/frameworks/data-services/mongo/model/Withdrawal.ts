
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";
import { WithdrawalCryptoDestination, WithdrawalPaymentMethod, WithdrawalStatus, WithdrawalSubType, WithdrawalType, WithdrawalWalletType, WithdrawalWalletTypeList, WITHDRAWAL_PAYMENT_METHOD_LIST, WITHDRAWAL_STATUS_LIST, WITHDRAWAL_SUB_TYPE_LIST, WITHDRAWAL_TYPE_LIST } from "src/core/entities/Withdrawal";


export type WithdrawalDocument = Withdrawal & Document;

@Schema({
  timestamps: true

})
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
    ref: "Transaction",
  })
  feeTransactionId: string

  @Prop({
    type: Types.ObjectId,
    ref: "Transaction",
  })
  feeWalletTransactionId: string

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
  destination: WithdrawalCryptoDestination

  @Prop()
  processedReason: string

  @Prop()
  currency: string

  @Prop({ type: Object })
  metadata: Object

  @Prop()
  tatumReference: string

  @Prop()
  tatumWithdrawalId: string

  @Prop()
  reference: string

  @Prop()
  blockchainTransactionId: string

  @Prop({ enum: WITHDRAWAL_TYPE_LIST })
  type: WithdrawalType

  @Prop({ enum: WithdrawalWalletTypeList })
  walletWithdrawalType: WithdrawalWalletType

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



const WithdrawalSchema = SchemaFactory.createForClass(Withdrawal);
WithdrawalSchema.index({
  userId: 'text',
  _id: 'text',
  reference: 'text',
  id: 'text',

},
  {
    weights: {
      reference: 5,
      _id: 5,
      id: 5
    },
  },);

export { WithdrawalSchema }

