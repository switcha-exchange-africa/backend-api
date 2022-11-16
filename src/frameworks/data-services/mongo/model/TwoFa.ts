import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";

export type TwoFaDocument = TwoFa & Document;

@Schema({
  timestamps: true
})
export class TwoFa {
  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true,
  })
  userId: string;

  @Prop()
  email: string;

  @Prop()
  securityQuestion: string;

  @Prop()
  secret: string;


  @Prop()
  securityAnswer: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;


}

export const TwoFaSchema = SchemaFactory.createForClass(TwoFa);
