import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { IDataServices } from "src/core/abstracts";
import { ICreateTradeDispute, IGetSingleTradeDispute, IGetTradeDisputes } from "src/core/dtos/trade-disputes";
import { Coin } from "src/core/entities/Coin";
import { TradeDispute } from "src/core/entities/Trade-Disputes";
import { IErrorReporter } from "src/core/types/error";
import { ResponseState, ResponsesType } from "src/core/types/response";
import { Status } from "src/core/types/status";
import { UtilsServices } from "../utils/utils.service";
import { TradeDisputeFactoryService } from "./trade-dispute-factory.service";

@Injectable()
export class TradeDisputeServices {
  constructor(
    private data: IDataServices,
    private readonly utilsService: UtilsServices,
    private readonly factory: TradeDisputeFactoryService
  ) { }

  cleanQueryPayload(payload: IGetTradeDisputes) {
    let key = {}
    if (payload.userId) key['userId'] = payload.userId
    if (payload.perpage) key['perpage'] = payload.perpage
    if (payload.page) key['page'] = payload.page
    if (payload.dateFrom) key['dateFrom'] = payload.dateFrom
    if (payload.dateTo) key['dateTo'] = payload.dateTo
    if (payload.sortBy) key['sortBy'] = payload.sortBy
    if (payload.orderBy) key['orderBy'] = payload.orderBy
    if (payload.tradeId) key['tradeId'] = payload.tradeId
    if (payload.disputeId) key['disputeId'] = payload.disputeId
    if (payload.resolvedBy) key['resolvedBy'] = payload.resolvedBy
    if (payload.resolveAdminBy) key['resolveAdminBy'] = payload.resolveAdminBy
    if (payload.status) key['status'] = payload.status
    if (payload.buyer) key['buyer'] = payload.buyer
    if (payload.seller) key['seller'] = payload.seller

    return key
  }

  async createTradeDispute(payload: ICreateTradeDispute) {
    const { email, tradeId, userId, buyer, seller } = payload
    try {
      const order = await this.data.p2pOrders.findOne({ _id: tradeId })
      if (!order) {
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          error: null,
          message: 'Trade does not exists'
        })
      }
      const disputePayload = {
        userId,
        tradeId,
        buyer,
        seller
      }
      const factory = await this.factory.create(disputePayload)
      const data = await this.data.tradeDisputes.create(factory)
      await this.data.p2pOrders.update({ _id: tradeId }, { status: Status.DISPUTE })
      return {
        message: "Trade dispute created successfully",
        status: HttpStatus.OK,
        data,
        state: ResponseState.SUCCESS,
      };

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'CREATE TRADE DISPUTE',
        error,
        email,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async getAllTradeDispute(payload: IGetTradeDisputes): Promise<ResponsesType<Coin>> {
    const { email } = payload
    try {

      const cleanedPayload = this.cleanQueryPayload(payload)
      const { data, pagination } = await this.data.tradeDisputes.findAllWithPagination({
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
        action: 'Get All Trade Dispute',
        error,
        email,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }


  async getSingleTradeDispute(payload: IGetSingleTradeDispute): Promise<ResponsesType<TradeDispute>> {
    const { email, id } = payload
    try {

      const data = await this.data.tradeDisputes.findOne(
        { _id: id },
        null,
        { populate: ['buyer', 'seller', 'messages'] })
      if (!data) {
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: 'Dispute does not exists',
          error: null
        })
      }
      return Promise.resolve({
        message: "Message read successfully",
        status: HttpStatus.OK,
        data,
        state: ResponseState.SUCCESS,
      });

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'Get Single Trade Dispute',
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

  async resolveATradeDispute(payload: IGetSingleTradeDispute): Promise<ResponsesType<TradeDispute>> {
    const { email, id } = payload
    try {

      const data = await this.data.tradeDisputes.update(
        { _id: id },
        { status: Status.RESOLVED },)

      return Promise.resolve({
        message: "Message read successfully",
        status: HttpStatus.OK,
        data,
        state: ResponseState.SUCCESS,
      });

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'Resolve A Trade Dispute',
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
}
