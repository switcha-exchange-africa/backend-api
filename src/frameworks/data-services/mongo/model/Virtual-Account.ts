import {
    Prop,
    Schema,
    SchemaFactory
} from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { CoinType } from 'src/core/types/coin';


export type VirtualAccountDocument = VirtualAccount & Document;


@Schema({
    timestamps: true

})
export class VirtualAccount {

    @Prop()
    key: string

    @Prop()
    currency: CoinType

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

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

}

export const VirtualAccountSchema = SchemaFactory.createForClass(VirtualAccount);
