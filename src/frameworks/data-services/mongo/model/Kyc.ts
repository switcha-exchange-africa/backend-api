import {
  Prop,
  Schema,
  SchemaFactory
} from '@nestjs/mongoose';
import { Types, Document, now } from 'mongoose';
import { Status, STATUS_LIST } from 'src/core/types/status';
import { USER_LEVEL_LIST, USER_LEVEL_TYPE } from 'src/lib/constants';


export type KycDocument = Kyc & Document;

@Schema()
export class Kyc {
  @Prop()
  image: string;

  @Prop()
  selfie: string;

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true
  })
  userId: string;

  @Prop({ enum: STATUS_LIST, default: Status.PENDING })
  status: Status

  @Prop({ enum: USER_LEVEL_LIST })
  level: USER_LEVEL_TYPE

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export const KycSchema = SchemaFactory.createForClass(Kyc);
