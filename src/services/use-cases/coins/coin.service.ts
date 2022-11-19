import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Types } from "mongoose";
import { IDataServices } from "src/core/abstracts";
import { Coin, CoinType, IGetCoins } from "src/core/entities/Coin";
import { ResponseState, ResponsesType } from "src/core/types/response";

@Injectable()
export class CoinServices {
  constructor(private data: IDataServices) { }

  cleanQueryPayload(payload: IGetCoins) {
    let key = {}
    if (payload.userId) key['userId'] = payload.userId
    if (payload.perpage) key['perpage'] = payload.perpage
    if (payload.page) key['page'] = payload.page
    if (payload.dateFrom) key['dateFrom'] = payload.dateFrom
    if (payload.dateTo) key['dateTo'] = payload.dateTo
    if (payload.sortBy) key['sortBy'] = payload.sortBy
    if (payload.orderBy) key['orderBy'] = payload.orderBy
    if (payload.coin) key['coin'] = payload.coin
    if (payload.type) key['type'] = payload.type

    return key
  }
  async seed(userId: string): Promise<ResponsesType<Coin>> {
    try {

      const seed: Coin[] = [
        {
          userId,
          coin: 'BTC',
          type: CoinType.CRYPTO,
          canSwap: true,
          canBuy: true,
          canSell: true,
          canP2p: true,
          canWithdraw: true,
          externalDeposit: true,
          bankTransferDeposit: false

        },
        {
          userId,
          coin: 'ETH',
          type: CoinType.CRYPTO,
          canSwap: true,
          canBuy: true,
          canSell: true,
          canP2p: true,
          canWithdraw: true,
          externalDeposit: true,
          bankTransferDeposit: false


        },
        {
          userId,
          coin: 'USDT',
          type: CoinType.CRYPTO,
          canSwap: true,
          canBuy: true,
          canSell: true,
          canP2p: true,
          canWithdraw: true,
          externalDeposit: true,
          bankTransferDeposit: false


        },
        {
          userId,
          coin: 'USDT_TRON',
          type: CoinType.CRYPTO,
          canSwap: true,
          canBuy: true,
          canSell: true,
          canP2p: true,
          canWithdraw: true,
          externalDeposit: true,
          bankTransferDeposit: false


        },
        {
          userId,
          coin: 'USDC',
          canSwap: true,
          type: CoinType.CRYPTO,
          canBuy: true,
          canSell: true,
          canP2p: true,
          canWithdraw: true,
          externalDeposit: true,
          bankTransferDeposit: false

        },
        {
          userId,
          coin: 'NGN',
          canSwap: false,
          type: CoinType.FIAT,
          canBuy: false,
          canSell: false,
          canP2p: false,
          canWithdraw: false,
          externalDeposit: false,
          bankTransferDeposit: true

        },
      ]
      const data = await this.data.coins.create(seed)

      return Promise.resolve({
        message: "Coins seeded successfully",
        status: HttpStatus.CREATED,
        data,
        state: ResponseState.SUCCESS,

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

  async getAllCoins(payload: IGetCoins): Promise<ResponsesType<Coin>> {
    try {

      const cleanedPayload = this.cleanQueryPayload(payload)
      const { data, pagination } = await this.data.coins.findAllWithPagination({
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
        message: "Coin retrieved successfully",
        status: HttpStatus.OK,
        data,
        pagination,
        state: ResponseState.SUCCESS,
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

  async getSingleCoin(id: Types.ObjectId) {
    try {

      const coin = await this.data.coins.findOne({ _id: id });
      const rate = await this.data.exchangeRates.findOne({ coin: coin.coin.toUpperCase() }, null, { sort: 'desc' });
      const data = {
        coin,
        rate
      }
      return Promise.resolve({
        message: "Coin Details retrieved succesfully",
        status: 200,
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


  async addCoin(payload: { coin: string }) {
    try {
      const { coin } = payload
      const coinExists = await this.data.coins.findOne({ coin });
      if (coinExists) {
        return Promise.reject({
          status: HttpStatus.CONFLICT,
          state: ResponseState.ERROR,
          error: null,
          message: "Coin already enabled"
        })
      }
      const data = {
        coin,
      }
      return Promise.resolve({
        message: "Coin Details retrieved succesfully",
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
}
