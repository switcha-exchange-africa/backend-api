import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";
import { BLOCKCHAIN_NETWORK, BLOCKCHAIN_NETWORK_LIST, WALLET_STATUS, WALLET_STATUS_LIST } from "src/core/entities/wallet.entity";

export type WalletDocument = Wallet & Document;

@Schema({
  timestamps: true

})
export class Wallet {
  @Prop({
    default: 0
  })
  balance: number;

  @Prop({
    default: 0
  })
  lockedBalance: number;

  @Prop()
  address: string;

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true,
  })
  userId: string;

  @Prop()
  accountId: string;

  @Prop({ enum: BLOCKCHAIN_NETWORK_LIST })
  network: BLOCKCHAIN_NETWORK;

  @Prop()
  coin: string;

  @Prop()
  derivationKey: string;

  @Prop()
  privateKey: string;

  @Prop({ enum: WALLET_STATUS_LIST })
  status: WALLET_STATUS;

  @Prop({ default: 0 })
  lastDeposit: number;

  @Prop({ default: 0 })
  lastWithdrawal: number;

  @Prop()
  reference: string

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  isBlocked: boolean;

  @Prop({ default: false })
  isActivated: boolean;

  @Prop()
  destinationTag: string;

  @Prop()
  memo: string;

  @Prop()
  xpub: string;

  @Prop()
  tatumMessage: string;


}


const WalletSchema = SchemaFactory.createForClass(Wallet);
WalletSchema.index({
  reference: 'text',
  _id: 'text',
  id: 'text'

},
  {
    weights: {
      reference: 5,
      _id: 5,
      id: 5
    },
  },);

export { WalletSchema }