
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, now, Document } from "mongoose";

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

export const ActivitySchema = SchemaFactory.createForClass(Activity);

