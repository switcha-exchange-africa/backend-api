import {
    Prop,
    Schema,
    SchemaFactory
  } from '@nestjs/mongoose';

export type TransactionReferenceDocument = TransactionReference & Document;

@Schema()
export class TransactionReference{

    @Prop()
    userId: string

    @Prop()
    hash: string

    @Prop()
    amount: number
    
}

export const TransactionReferenceSchema = SchemaFactory.createForClass(TransactionReference);
