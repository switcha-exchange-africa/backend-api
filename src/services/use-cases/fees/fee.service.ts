import { HttpStatus, Injectable, Logger } from "@nestjs/common"
import { Types } from "mongoose"
import { IDataServices } from "src/core/abstracts"
import { IAmountType, IGetFee } from "src/core/dtos/fee"
import { ResponseState } from "src/core/types/response"

@Injectable()
export class FeeServices {
  constructor(
    private data: IDataServices
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
          amountType: IAmountType.PERCENTAGE,
          userId
        },
        {
          feature: "buy",
          amountInPercentage: 0.5,
          amountInFixed: 0,
          amountType: IAmountType.PERCENTAGE,
          userId
        },
        {
          feature: "sell",
          amountInPercentage: 0.5,
          amountInFixed: 0,
          amountType: IAmountType.PERCENTAGE,
          userId
        },
        {
          feature: "p2p-sell",
          amountInPercentage: 0.5,
          amountInFixed: 0,
          amountType: IAmountType.PERCENTAGE,
          userId
        },
        {
          feature: "p2p-buy",
          amountInPercentage: 0.5,
          amountInFixed: 0,
          amountType: IAmountType.PERCENTAGE,
          userId
        },

        {
          feature: "fiat-withdrawal",
          amountInPercentage: 0.5,
          amountInFixed: 0,
          amountType: IAmountType.PERCENTAGE,
          userId
        },
        {
          feature: "fiat-deposit",
          amountInPercentage: 0.5,
          amountInFixed: 0,
          amountType: IAmountType.PERCENTAGE,
          userId
        },
        {
          feature: "crypto-withdrawal",
          amountInPercentage: 0.5,
          amountInFixed: 0,
          amountType: IAmountType.PERCENTAGE,
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
}
