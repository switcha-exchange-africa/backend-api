import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, now, Document } from "mongoose";

export type UserFeatureManagementDocument = UserFeatureManagement & Document;

@Schema()
export class UserFeatureManagement {
  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true,
  })
  userId: string;

  @Prop({ default: true })
  canBuy: boolean;

  @Prop({ default: true })
  canSell: boolean;

  @Prop({ default: true })
  canSwap: boolean;

  @Prop({ default: false })
  canP2PBuy: boolean;

  @Prop({ default: false })
  canP2PSell: boolean;

  @Prop({ default: true })
  canWithdraw: boolean;

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;


}

export const UserFeatureManagementSchema = SchemaFactory.createForClass(UserFeatureManagement);
