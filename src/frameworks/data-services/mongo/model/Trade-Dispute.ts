import {
  Prop,
  Schema,
  SchemaFactory
} from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import { Status, STATUS_LIST } from 'src/core/types/status';


export type TradeDisputeDocument = TradeDispute & Document;


@Schema({
  timestamps: true

})
export class TradeDispute {

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true
  })
  userId: string;

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true
  })
  buyer: string;

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true
  })
  seller: string;

  @Prop({
    type: Types.ObjectId,
    ref: "P2pOrder",
  })
  tradeId: string

  @Prop()
  disputeId: string

  @Prop({ type: [{ type: Types.ObjectId, ref: 'ChatMessage' }] })
  messages: string[];

  @Prop({
    type: Types.ObjectId,
    ref: "User",
  })
  resolvedBy: string

  @Prop({ enum: STATUS_LIST })
  status: Status

  @Prop({
    type: Types.ObjectId,
    ref: "Admin",
  })
  resolveAdminBy: string

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

}

const TradeDisputeSchema = SchemaFactory.createForClass(TradeDispute);

TradeDisputeSchema.index({
  disputeId: 'text',
  tradeId: 'text',
  _id: 'text',

},
  {
    weights: {
      disputeId: 5,
      tradeId: 5,
      _id: 5,

    },
  });

export { TradeDisputeSchema }