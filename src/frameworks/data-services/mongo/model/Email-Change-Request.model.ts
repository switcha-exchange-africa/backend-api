import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types , Document} from "mongoose";
import { EmailChangeRequestStatus, EmailChangeRequestStatusList } from "src/core/entities/email-change-request.entity";

export type EmailChangeRequestDocument = EmailChangeRequest & Document;

@Schema({
  timestamps: true

})
export class EmailChangeRequest {
  @Prop()
  email: string

  @Prop()
  reason: string

  @Prop({ enum: EmailChangeRequestStatusList })
  status: EmailChangeRequestStatus;

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

export const EmailChangeRequestSchema = SchemaFactory.createForClass(EmailChangeRequest);
