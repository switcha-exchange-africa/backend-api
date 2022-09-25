import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Types } from "mongoose";
import { IDataServices } from "src/core/abstracts";
import { IGetWallets } from "src/core/dtos/wallet/wallet.dto";
import { FeeWallet } from "src/core/entities/FeeWallet";
import { CoinType } from "src/core/types/coin";
import { ResponseState, ResponsesType } from "src/core/types/response";
import { generateReference } from "src/lib/utils";

@Injectable()
export class FeeWalletServices {
  constructor(private data: IDataServices) { }
  cleanQueryPayload(payload: IGetWallets) {
    let key = {}
    if (payload.userId) key['userId'] = payload.userId
    if (payload.coin) key['coin'] = payload.coin
    if (payload.perpage) key['perpage'] = payload.perpage
    if (payload.page) key['page'] = payload.page
    if (payload.dateFrom) key['dateFrom'] = payload.dateFrom
    if (payload.dateTo) key['dateTo'] = payload.dateTo
    if (payload.sortBy) key['sortBy'] = payload.sortBy
    if (payload.orderBy) key['orderBy'] = payload.orderBy
    if (payload.reference) key['reference'] = payload.reference
    
    return key
  }

  async seedWallets(userId: string): Promise<ResponsesType<FeeWallet[]>> {
    try {
      const seed = [
        {
          userId,
          coin: CoinType.BTC,
          reference:generateReference('general')
        },
        {
          userId,
          coin: CoinType.USD,
          reference:generateReference('general')
        },
        {
          userId,
          coin: CoinType.USDC,
          reference:generateReference('general')

        },
        {
          userId,
          coin: CoinType.USDT,
          reference:generateReference('general')

        },
        {
          userId,
          coin: CoinType.USDT_TRON,
          reference:generateReference('general')

        },
        {
          userId,
          coin: CoinType.ETH,
          reference:generateReference('general')

        },
        {
          userId,
          coin: CoinType.NGN,
          reference:generateReference('general')

        },
      ]

      const data = await this.data.feeWallets.create(seed)
      return {
        status: HttpStatus.OK,
        message: "Wallets seeded successfully",
        data,
        state: ResponseState.SUCCESS
      };

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

  async getAllWallets(payload: IGetWallets): Promise<ResponsesType<FeeWallet>> {
    try {
      const cleanedPayload = this.cleanQueryPayload(payload)
      const { data, pagination } = await this.data.feeWallets.findAllWithPagination({
        query: cleanedPayload,
        queryFields: {},
        misc: {
          populated: {
            path: 'userId',
            select: '_id firstName lastName email phone'
          }
        }
      });

      return {
        status: HttpStatus.OK,
        message: "Fee Wallets retrieved successfully",
        data,
        pagination,
        state: ResponseState.SUCCESS
      };
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

  async getSingleWallet(id: Types.ObjectId): Promise<ResponsesType<FeeWallet>> {
    try {
      const data = await this.data.feeWallets.findOne({ _id: id });
      if (!data) return Promise.reject({
        status: HttpStatus.NOT_FOUND,
        state: ResponseState.ERROR,
        message: 'Wallet does not exist',
        error: null,
      })
      return { status: HttpStatus.OK, message: "Wallet retrieved successfully", data, state: ResponseState.SUCCESS };
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