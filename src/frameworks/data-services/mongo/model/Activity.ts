
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types, Document } from "mongoose";

export type ActivityDocument = Activity & Document;

@Schema({
  timestamps: true

})
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
  coin: string

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true
  })
  userId: string;

  @Prop({
    default: 0
  })
  amount: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);



// 4245519