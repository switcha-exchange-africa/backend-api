import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";

export type FeatureManagementDocument = FeatureManagement & Document;

@Schema({
  timestamps: true

})
export class FeatureManagement {

  @Prop()
  feature: string

  @Prop({ default: true })
  active: boolean;

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

export const FeatureManagementSchema = SchemaFactory.createForClass(FeatureManagement);
