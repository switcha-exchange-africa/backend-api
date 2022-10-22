import { JWT_USER_PAYLOAD_TYPE } from "src/lib/constants"
export enum ResponseState {
  SUCCESS = 'success',
  ERROR = 'error'
}
export type ResponsesType<T> = {
  message: string
  token?: string
  data: string | T | T[] | JWT_USER_PAYLOAD_TYPE
  extra?: any
  verification?: string[]
  pagination?: Record<string, any>
  status: number
  state: ResponseState
}