import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { IDataServices } from "src/core/abstracts";
import { ICreateChatMessage, IGetChatMessages, IGetSingleChatMessage } from "src/core/dtos/chat-messages";
import { IErrorReporter } from "src/core/types/error";
import { ResponseState, ResponsesType } from "src/core/types/response";
import { UtilsServices } from "../utils/utils.service";
import jwtLib from "src/lib/jwtLib";
import { ChatMessage } from "src/core/entities/Chat-Messages";
import { ChatMessagesFactoryService } from "./chat-messages-factory.service";

@Injectable()
export class ChatMessagesServices {
  constructor(
    private data: IDataServices,
    private readonly utilsService: UtilsServices,
    private readonly factory: ChatMessagesFactoryService

  ) { }

  cleanQueryPayload(payload: IGetChatMessages) {
    let key = {}
    if (payload.userId) key['userId'] = payload.userId
    if (payload.perpage) key['perpage'] = payload.perpage
    if (payload.page) key['page'] = payload.page
    if (payload.dateFrom) key['dateFrom'] = payload.dateFrom
    if (payload.dateTo) key['dateTo'] = payload.dateTo
    if (payload.sortBy) key['sortBy'] = payload.sortBy
    if (payload.orderBy) key['orderBy'] = payload.orderBy
    if (payload.adminId) key['adminId'] = payload.adminId
    if (payload.read) key['read'] = payload.read
    if (payload.tradeDisputeId) key['tradeDisputeId'] = payload.tradeDisputeId

    return key
  }
  async sendMessage(payload: ICreateChatMessage) {
    try {
      const { message, tradeDisputeId, userId } = payload
      const factory = this.factory.create({ userId, message, tradeDisputeId })
      const data = await this.data.chatMessages.create(factory)
      return { data, room: payload.room }
    } catch (error) {

      throw new Error(error)
    }

  }


  async getAllChatMessages(payload: IGetChatMessages): Promise<ResponsesType<ChatMessage>> {
    const { email } = payload
    try {

      const cleanedPayload = this.cleanQueryPayload(payload)
      const { data, pagination } = await this.data.chatMessages.findAllWithPagination({
        query: cleanedPayload,
        queryFields: {},
        misc: {
          populated: ['userId', 'tradeDisputeId', 'adminId']
        }
      });


      return Promise.resolve({
        message: "Messages retrieved successfully",
        status: HttpStatus.OK,
        data,
        pagination,
        state: ResponseState.SUCCESS,
      });

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'Get Chat Messages',
        error,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        email,
        message: error.message,
        error: error
      })
    }
  }

  async readMessage(payload: IGetSingleChatMessage): Promise<ResponsesType<ChatMessage>> {
    const { email, id } = payload
    try {

      const data = await this.data.chatMessages.update({ _id: id }, { read: true })

      return Promise.resolve({
        message: "Message read successfully",
        status: HttpStatus.OK,
        data,
        state: ResponseState.SUCCESS,
      });

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'Read Chat Message',
        error,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        email,
        message: error.message,
        error: error
      })
    }
  }

  async authenticate(token: string) {
    try {
      const decoded = await jwtLib.jwtVerify(token);
      if (!decoded) {
        return {
          isAuthenticated: false,
          user: null
        }
      }
      const user = await this.data.users.findOne({ id: decoded._id })
      if (!user) {
        return {
          isAuthenticated: false,
          user: null
        }
      }
      return {
        isAuthenticated: true,
        user
      }
    } catch (error) {
      throw new Error()
    }
  }

}
