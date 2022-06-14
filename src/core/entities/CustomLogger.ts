import { CustomLoggerErrorType, CustomLoggerMethod, CustomLoggerOperationType } from "../dtos/custom-logger"

export class CustomLogger {
  endpoint: string;
  statusCode: string;
  method: CustomLoggerMethod;
  operation: string;
  message: string;
  type: string;
  error: CustomLoggerErrorType;
  operationType: CustomLoggerOperationType;
  userId: string;
  walletId: string;
  ip: string;
  createdAt: Date;
  updatedAt: Date;

}

