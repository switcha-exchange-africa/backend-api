import {
  Prop,
  Schema,
  SchemaFactory
} from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { Status, STATUS_LIST } from 'src/core/types/status';
import { USER_LEVEL_LIST, USER_LEVEL_TYPE } from 'src/lib/constants';


export type KycDocument = Kyc & Document;

@Schema({
  timestamps: true

})
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

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

const KycSchema = SchemaFactory.createForClass(Kyc);
KycSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
});

KycSchema.pre<KycDocument>(/^find/, function (next) {
  this.populate({
    path: 'user',
    options: { select: 'username email level firstName lastName' } // <-- wrap `select` in `options` here...
  })

  next();
});

KycSchema.index({
  _id: 'text',
  id: 'text',
  userId: 'text',
},
  {
    weights: {
      _id: 5,
      userId: 5,
      id: 5
    },
  },);

export { KycSchema }