/**
 * Logger 
 * userId
 * operation/action
 * type :- error or success
 * message
 * operationType:- internal,external
 * error {
 *     - type
 *     - message
 * }
 * metaData
 */



import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { CustomLoggerErrorType, CustomLoggerMethod, CustomLoggerMethodList, CustomLoggerOperationType, CustomLoggerOperationTypeList, CustomLoggerType, CustomLoggerTypeList } from "src/core/dtos/custom-logger";

export type CustomLoggerDocument = CustomLogger & Document;

@Schema()
export class CustomLogger {
  @Prop()
  endpoint: string

  @Prop()
  statusCode: string

  @Prop({ enum: CustomLoggerMethodList })
  method: CustomLoggerMethod

  @Prop()
  operation: string

  @Prop()
  message: string

  @Prop()
  ip: string

  @Prop({ enum: CustomLoggerTypeList })
  type: CustomLoggerType

  @Prop({ type: { type: String, message: String } })
  error: CustomLoggerErrorType

  @Prop({ enum: CustomLoggerOperationTypeList })
  operationType: CustomLoggerOperationType

  @Prop({
    type: Types.ObjectId,
    ref: "User",
    required: true
  })
  userId: string;

  @Prop({
    type: Types.ObjectId,
    ref: "Wallet",
    required: true
  })
  walletId: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CustomLoggerSchema = SchemaFactory.createForClass(CustomLogger);

