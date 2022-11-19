import { IDataServices } from "src/core/abstracts";
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Types } from "mongoose";
import { IGetTransactions } from "src/core/dtos/transactions";
import { ResponseState } from "src/core/types/response";

@Injectable()
export class TransactionServices {
  constructor(private data: IDataServices) { }
  cleanQueryPayload(payload: IGetTransactions) {
    let key = {}
    if (payload.userId) key['userId'] = payload.userId
    if (payload.perpage) key['perpage'] = payload.perpage
    if (payload.page) key['page'] = payload.page
    if (payload.dateFrom) key['dateFrom'] = payload.dateFrom
    if (payload.dateTo) key['dateTo'] = payload.dateTo
    if (payload.sortBy) key['sortBy'] = payload.sortBy
    if (payload.orderBy) key['orderBy'] = payload.orderBy
    if (payload.walletId) key['walletId'] = payload.walletId
    if (payload.currency) key['currency'] = payload.currency
    if (payload.tatumTransactionId) key['tatumTransactionId'] = payload.tatumTransactionId
    if (payload.reference) key['reference'] = payload.reference
    if (payload.generalTransactionReference) key['generalTransactionReference'] = payload.generalTransactionReference
    if (payload.senderAddress) key['senderAddress'] = payload.senderAddress
    if (payload.type) key['type'] = payload.type
    if (payload.subType) key['subType'] = payload.subType
    if (payload.status) key['status'] = payload.status
    if (payload.customTransactionType) key['customTransactionType'] = payload.customTransactionType
    if (payload.hash) key['hash'] = payload.hash
    if (payload.accountId) key['accountId'] = payload.accountId

    

    return key
  }
  async getAllTransactions(payload: IGetTransactions) {
    try {
      const { q, perpage, page, dateFrom, dateTo, sortBy, orderBy } = payload
      if (q) {
        console.log("q", q)
        const { data, pagination } = await this.data.transactions.search({
          query: {
            q,
            perpage,
            page,
            dateFrom,
            dateTo,
            sortBy,
            orderBy,
          }
        })
        return {
          status: 200,
          message: "Transaction retrieved successfully",
          data,
          pagination,
        };
      }
      const cleanedPayload = this.cleanQueryPayload(payload)
      const { data, pagination } = await this.data.transactions.findAllWithPagination({
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
        message: "Transaction retrieved successfully",
        status: 200,
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

  async getSingleTransaction(id: Types.ObjectId) {
    try {

      const data = await this.data.transactions.findOne({ _id: id });
      return Promise.resolve({
        message: "Transaction Details retrieved succesfully",
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
}
