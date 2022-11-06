import { Types } from "mongoose";
import { PaginationType } from "src/core/types/database";

export type IGetChatMessages = PaginationType & {
  userId: string;
  adminId: string;
  read: boolean
  tradeDisputeId: string
  email?: string

}

export type IGetSingleChatMessage = {
  id: Types.ObjectId
  email: string
}

export type ICreateChatMessage = {
  userId?: string;
  adminId?: string;
  message?: string
  read?: boolean
  tradeDisputeId?: string
  room?: string
}