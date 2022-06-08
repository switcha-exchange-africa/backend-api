import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export type BankDocument = Bank & Document;

@Schema()
export class Bank {
  @Prop()
  name: string

  @Prop()
  code: string

  @Prop()
  branch: string

  @Prop()
  accountName: string

  @Prop()
  accountNumber: string

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true
  })
  userId: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const BankSchema = SchemaFactory.createForClass(Bank);
