export type CustomLoggerErrorType = {
  type: string
  message: string
}
export enum CustomLoggerOperationType {
  INTERNAL = 'internal',
  EXTERNAL = 'external'
}
export enum CustomLoggerType {
  SUCCESS = 'success',
  ERROR = 'error'
}

export const CustomLoggerOperationTypeList = [
  CustomLoggerOperationType.EXTERNAL,
  CustomLoggerOperationType.INTERNAL,
]

export enum CustomLoggerMethod {
  PUT = 'PUT',
  POST = 'POST',
  GET = 'GET',
  DELETE = 'DELETE',
  PATCH = 'PATCH'
}

export const CustomLoggerMethodList = [
  CustomLoggerMethod.PUT,
  CustomLoggerMethod.POST,
  CustomLoggerMethod.GET,
  CustomLoggerMethod.DELETE,
  CustomLoggerMethod.PATCH,
]

export const CustomLoggerTypeList = [
  CustomLoggerType.SUCCESS,
  CustomLoggerType.ERROR,
]

export enum CustomLoggerLevel {
  ERROR = 'error',
  WARN = 'warn',
  LOG = 'log',
  VERBOSE = 'verbose',
  DEBUG = 'debug'
}
export const CustomLoggerLevelList = [
  CustomLoggerLevel.ERROR,
  CustomLoggerLevel.WARN,
  CustomLoggerLevel.LOG,
  CustomLoggerLevel.DEBUG,
  CustomLoggerLevel.VERBOSE

]
export class CustomLoggerEntity {
  context: string;
  endpoint: string;
  stack: string;
  statusCode: string;
  method: CustomLoggerMethod;
  operation: string;
  message: string;
  type: CustomLoggerType;
  error: CustomLoggerErrorType;
  operationType: CustomLoggerOperationType;
  userId: string;
  walletId: string;
  ip: string;
  level: CustomLoggerLevel;
  createdAt: Date;
  updatedAt: Date;

}
