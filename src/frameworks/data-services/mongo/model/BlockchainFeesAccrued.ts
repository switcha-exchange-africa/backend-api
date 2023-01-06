
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";

export type BlockchainFeesAccruedDocument = BlockchainFeesAccrued & Document;

/**
 * Blockchain fees accured during interaction with the blockchain
 *   * example when funds are withdrawed from users addresses and sent to the master addresses
 *   * fees spent when funds are withdrawed from the master addresses
 */
@Schema({
    timestamps: true
})
export class BlockchainFeesAccrued {
    @Prop()
    action: string

    @Prop()
    coin: string

    @Prop()
    fee: number

    @Prop()
    description: string

    @Prop({
        type: Types.ObjectId,
        ref: "User",
        required: true
    })
    userId: string;

    @Prop({
        type: Types.ObjectId,
        ref: "Wallet",
        required: true
    })
    walletId: string;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const BlockchainFeesAccruedSchema = SchemaFactory.createForClass(BlockchainFeesAccrued);

