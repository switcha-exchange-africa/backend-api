
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";

export type MutateUserDocument = MutateUser & Document;

@Schema({
  timestamps: true

})
export class MutateUser {
  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true,
  })
  userId: string;


  @Prop()
  reason: string;

  @Prop()
  type: string;

  @Prop({ default: true })
  active: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;


}

export const MutateUserSchema = SchemaFactory.createForClass(MutateUser);
