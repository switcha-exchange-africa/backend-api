import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, now, Document } from "mongoose";

export type UserFeatureManagementDocument = UserFeatureManagement & Document;

@Schema({
  timestamps: true

})
export class UserFeatureManagement {
  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true,
  })
  userId: string;

  @Prop({ default: false })
  canBuy: boolean;

  @Prop({ default: false })
  canSell: boolean;

  @Prop({ default: false })
  canSwap: boolean;

  @Prop({ default: false })
  canP2PBuy: boolean;

  @Prop({ default: false })
  canP2PSell: boolean;

  @Prop({ default: false })
  canWithdraw: boolean;

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;


}

export const UserFeatureManagementSchema = SchemaFactory.createForClass(UserFeatureManagement);
