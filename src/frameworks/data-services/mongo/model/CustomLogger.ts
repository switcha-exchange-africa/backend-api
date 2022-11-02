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
import { Types, Document } from "mongoose";
import { CustomLoggerLevel, CustomLoggerLevelList, CustomLoggerErrorType, CustomLoggerMethod, CustomLoggerMethodList, CustomLoggerOperationType, CustomLoggerOperationTypeList, CustomLoggerType, CustomLoggerTypeList } from "src/core/entities/CustomLogger";

export type CustomLoggerDocument = CustomLogger & Document;

@Schema({
  timestamps: true

})
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

  @Prop()
  stack: string

  @Prop()
  context: string;

  @Prop({ enum: CustomLoggerTypeList })
  type: CustomLoggerType

  @Prop({ type: { type: String, message: String } })
  error: CustomLoggerErrorType

  @Prop({ enum: CustomLoggerOperationTypeList })
  operationType: CustomLoggerOperationType

  @Prop({ enum: CustomLoggerLevelList })
  level: CustomLoggerLevel

  @Prop({
    type: Types.ObjectId,
    ref: "User",
  })
  userId: string;

  @Prop({
    type: Types.ObjectId,
    ref: "Wallet",
  })
  walletId: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CustomLoggerSchema = SchemaFactory.createForClass(CustomLogger);

