import {
  Prop,
  Schema,
  SchemaFactory
} from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Status, STATUS_LIST } from 'src/core/types/status';


export type KycDocument = Kyc & Document;

@Schema()
export class Kyc {
  @Prop()
  image: string;

  @Prop()
  selfie: string;

  @Prop()
  createdAt: Date

  @Prop()
  updatedAt: Date

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true
  })
  userId: string;

  @Prop({ enum: STATUS_LIST })
  status: Status


}

export const KycSchema = SchemaFactory.createForClass(Kyc);
