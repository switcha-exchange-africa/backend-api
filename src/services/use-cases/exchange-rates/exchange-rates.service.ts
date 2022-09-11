import { IDataServices } from "src/core/abstracts";
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Types } from "mongoose";
import { ResponseState } from "src/core/types/response";
import { ExchangeRateFactoryServices } from "./exchange-rate-factory.service";
import { ICreateExchangeRate, IGetExchangeRates } from "src/core/dtos/rates/rates.dto";

@Injectable()
export class ExchangeRateServices {
  constructor(
    private data: IDataServices,
    private factory: ExchangeRateFactoryServices
  ) { }

  cleanQueryPayload(payload: IGetExchangeRates) {
    let key = {}
    if (payload.userId) key['userId'] = payload.userId
    if (payload.perpage) key['perpage'] = payload.perpage
    if (payload.page) key['page'] = payload.page
    if (payload.dateFrom) key['dateFrom'] = payload.dateFrom
    if (payload.dateTo) key['dateTo'] = payload.dateTo
    if (payload.sortBy) key['sortBy'] = payload.sortBy
    if (payload.orderBy) key['orderBy'] = payload.orderBy
    if (payload.userId) key['userId'] = payload.userId
    if (payload.pair) key['pair'] = payload.pair

    return key
  }
  async createExchangeRate(payload: ICreateExchangeRate) {
    try {
      const factory = await this.factory.create(payload)
      const data = await this.data.exchangeRates.create(factory)

      return Promise.resolve({
        message: "Exchange rate created successfully",
        status: HttpStatus.CREATED,
        data,
      });

    } catch (error) {
      Logger.error(error)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async getAllExchangeRates(payload: IGetExchangeRates) {
    try {
      const cleanedPayload = this.cleanQueryPayload(payload)
      const { data, pagination } = await this.data.exchangeRates.findAllWithPagination({
        query: cleanedPayload,
        queryFields: {},
        misc: {
          populated: {
            path: 'userId',
            select: '_id firstName lastName email phone'
          }
        }
      });

      return Promise.resolve({
        message: "Exchange Rate retrieved successfully",
        status: HttpStatus.OK,
        data,
        pagination,
      });

    } catch (error) {
      Logger.error(error)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }

  async getSingleExchangeRate(id: Types.ObjectId) {
    try {

      const data = await this.data.exchangeRates.findOne({ _id: id });
      return Promise.resolve({
        message: "Exchange Rate retrieved succesfully",
        status: HttpStatus.OK,
        data,
      });

    } catch (error) {
      Logger.error(error)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }
  async getSingleExchangeRateByPair(pair: string) {
    try {

      const data = await this.data.exchangeRates.findOne({ pair }, null, { sort: 'desc' });
      return Promise.resolve({
        message: "Exchange Rate retrieved succesfully",
        status: HttpStatus.OK,
        data,
      });

    } catch (error) {
      Logger.error(error)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        message: error.message,
        error: error
      })
    }
  }
}
