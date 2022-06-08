
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

export type ActivityDocument = Activity & Document;

@Schema()
export class Activity {
  @Prop()
  action: string

  @Prop()
  image: string

  @Prop()
  type: string

  @Prop()
  description: string

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

export const ActivitySchema = SchemaFactory.createForClass(Activity);

