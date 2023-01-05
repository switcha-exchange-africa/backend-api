import { Prop, SchemaFactory, Schema } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

export type Deactivated2faRequestDocument = Deactivated2faRequest & Document;

@Schema({
    timestamps: true
})
export class Deactivated2faRequest {
    @Prop({
        type: Types.ObjectId,
        ref: "User",
        required: true
    })
    userId: string;

    @Prop({ default: false })
    isDeactivated: boolean

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}

export const Deactivated2faRequestSchema = SchemaFactory.createForClass(Deactivated2faRequest);
