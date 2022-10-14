import { HttpStatus, Injectable, Logger } from "@nestjs/common"
import { Types } from "mongoose"
import { IDataServices } from "src/core/abstracts"
import { ActivityAction } from "src/core/dtos/activity"
import { IFeeAmountType, IGetFee } from "src/core/dtos/fee"
import { ResponseState } from "src/core/types/response"
import { UtilsServices } from "../utils/utils.service"

@Injectable()
export class FeeServices {
  constructor(
    private data: IDataServices,
    private readonly utils: UtilsServices,

  ) { }

  cleanQueryPayload(payload: IGetFee) {
    let key = {}
    if (payload.userId) key['userId'] = payload.userId
    if (payload.perpage) key['perpage'] = payload.perpage
    if (payload.page) key['page'] = payload.page
    if (payload.dateFrom) key['dateFrom'] = payload.dateFrom
    if (payload.dateTo) key['dateTo'] = payload.dateTo
    if (payload.sortBy) key['sortBy'] = payload.sortBy
    if (payload.orderBy) key['orderBy'] = payload.orderBy
    if (payload.userId) key['userId'] = payload.userId
    if (payload.feature) key['feature'] = payload.feature
    if (payload.amountType) key['amountType'] = payload.amountType


    return key
  }
  async seedFee(userId: string) {
    try {
      const seed = [
        {
          feature: "swap",
          amountInPercentage: 0.5,
          amountInFixed: 0,
          amountType: IFeeAmountType.PERCENTAGE,
          userId
        },
        {
          feature: "buy",
          amountInPercentage: 0.5,
          amountInFixed: 0,
          amountType: IFeeAmountType.PERCENTAGE,
          userId
        },
        {
          feature: "sell",
          amountInPercentage: 0.5,
          amountInFixed: 0,
          amountType: IFeeAmountType.PERCENTAGE,
          userId
        },
        {
          feature: "p2p-sell",
          amountInPercentage: 0.5,
          amountInFixed: 0,
          amountType: IFeeAmountType.PERCENTAGE,
          userId
        },
        {
          feature: "p2p-buy",
          amountInPercentage: 0.5,
          amountInFixed: 0,
          amountType: IFeeAmountType.PERCENTAGE,
          userId
        },

        {
          feature: "fiat-withdrawal",
          amountInPercentage: 0.5,
          amountInFixed: 0,
          amountType: IFeeAmountType.PERCENTAGE,
          userId
        },
        {
          feature: "fiat-deposit",
          amountInPercentage: 0.5,
          amountInFixed: 0,
          amountType: IFeeAmountType.PERCENTAGE,
          userId
        },
        {
          feature: "crypto-withdrawal",
          amountInPercentage: 0.5,
          amountInFixed: 0,
          amountType: IFeeAmountType.PERCENTAGE,
          userId
        }
      ]
      const data = await this.data.fees.create(seed)

      return Promise.resolve({
        message: "Fees seeded successfully",
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

  async seedWithdrawalFees(userId: string) {
    try {
      const seed = [
        {
          coin: "USDT",
          fee: 20,
          userId
        },
        {
          coin: "USDC",
          fee: 20,
          userId
        },
        {
          coin: "USDT_TRON",
          fee: 1,
          userId
        },
        {
          coin: "BTC",
          fee: 0.0003,
          userId
        },
        {
          coin: "ETH",
          fee: 0.004,
          userId
        },
      ]
      const data = await this.data.coinWithdrawalFee.create(seed)

      return Promise.resolve({
        message: "Fees seeded successfully",
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
  async getAllFees(payload: IGetFee) {
    try {
      const cleanedPayload = this.cleanQueryPayload(payload)
      const { data, pagination } = await this.data.fees.findAllWithPagination({
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
        message: "Fee retrieved successfully",
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

  async getSingleFee(id: Types.ObjectId) {
    try {

      const data = await this.data.fees.findOne({ _id: id });
      return Promise.resolve({
        message: "Fee retrieved succesfully",
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
  async getSingleFeeByFeature(feature: string) {
    try {

      const data = await this.data.fees.findOne({ feature });
      if (!data) return Promise.reject({
        status: HttpStatus.NOT_FOUND,
        state: ResponseState.ERROR,
        message: `Fee for this feature don't exists`,
        error: null
      })
      return Promise.resolve({
        message: "Fee retrieved succesfully",
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

  async calculateTradeFees(payload: {
    operation: ActivityAction,
    amount: number
  }) {
    try {

      const data = await this.utils.calculateFees(payload)
      return Promise.resolve({
        message: "Fee retrieved succesfully",
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

  async calculateWithdrawalFees(payload: {
    coin: string,
    amount: number
  }) {
    try {

      const data = await this.utils.calculateWithdrawalFees(payload)
      return Promise.resolve({
        message: "Fee retrieved succesfully",
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
