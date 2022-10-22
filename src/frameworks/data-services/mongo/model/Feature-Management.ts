import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, now, Document } from "mongoose";

export type FeatureManagementDocument = FeatureManagement & Document;

@Schema()
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

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const FeatureManagementSchema = SchemaFactory.createForClass(FeatureManagement);
