import {
    Prop,
    Schema,
    SchemaFactory
} from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';


export type VirtualAccountDocument = VirtualAccount & Document;


@Schema({
    timestamps: true

})
export class VirtualAccount {

    @Prop()
    key: string

    @Prop()
    coin: string

    @Prop({
        type: Types.ObjectId,
        ref: "User",
        required: true
    })
    userId: string;

    @Prop()
    accountId: string

    @Prop()
    pendingTransactionSubscriptionId: string

    @Prop()
    incomingTransactionSubscriptionId: string

    @Prop()
    withdrawalTransactionSubscriptionId: string

    @Prop()
    xpub: string

    @Prop()
    mnemonic: string

    @Prop({ default: true })
    active: boolean;

    @Prop({ default: false })
    frozen: boolean;

    @Prop({ default: 0 })
    lastDeposit: number;

    @Prop({ default: 0 })
    lastWithdrawal: number;

    @Prop({
        default: 0
    })
    balance: number;

    @Prop({
        default: 0
    })
    lockedBalance: number;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

}

export const VirtualAccountSchema = SchemaFactory.createForClass(VirtualAccount);
