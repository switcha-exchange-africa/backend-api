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
