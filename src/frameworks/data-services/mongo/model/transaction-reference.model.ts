import {
    Prop,
    Schema,
    SchemaFactory
  } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type TransactionReferenceDocument = TransactionReference & Document;

@Schema()
export class TransactionReference{

    @Prop({
      type: Types.ObjectId,
      ref: 'User',
      required: true
    })
    userId: string

    @Prop()
    hash: string

    @Prop()
    amount: number
    
}

export const TransactionReferenceSchema = SchemaFactory.createForClass(TransactionReference);
