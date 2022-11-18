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
    @Prop({
        type: Types.ObjectId,
        ref: "User",
        required: true
    })
    userId: string;

    @Prop()
    accountId: string

    @Prop()
    xpub: string

    @Prop()
    mnemonic: string

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

}

export const VirtualAccountSchema = SchemaFactory.createForClass(VirtualAccount);
