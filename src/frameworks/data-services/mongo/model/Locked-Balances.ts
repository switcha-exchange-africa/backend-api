import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";
import { STATUS_LIST, Status } from "src/core/types/status";

export type LockedBalanceDocument = LockedBalance & Document;

@Schema({
    timestamps: true
})
export class LockedBalance {
    @Prop({
        default: 0
    })
    amount: number;

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
        ref: "P2pOrder",
        required: true,
    })
    orderId: string;

    @Prop({ enum: STATUS_LIST, default: Status.PENDING })
    status: Status

    @Prop()
    action: string;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

}


const LockedBalanceSchema = SchemaFactory.createForClass(LockedBalance);


export { LockedBalanceSchema }