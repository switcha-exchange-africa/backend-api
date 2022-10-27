import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Types } from "mongoose";
import { IDataServices } from "src/core/abstracts";
import { IGetUsers } from "src/core/dtos/users";
import { ResponseState } from "src/core/types/response";

@Injectable()
export class UserServices {
  constructor(
    private data: IDataServices,
  ) { }
  cleanUserQueryPayload(payload: IGetUsers) {
    let key = {}
    if (payload.id) key['id'] = payload.id
    if (payload.perpage) key['perpage'] = payload.perpage
    if (payload.page) key['page'] = payload.page
    if (payload.dateFrom) key['dateFrom'] = payload.dateFrom
    if (payload.dateTo) key['dateTo'] = payload.dateTo
    if (payload.sortBy) key['sortBy'] = payload.sortBy
    if (payload.orderBy) key['orderBy'] = payload.orderBy
    if (payload.country) key['country'] = payload.country
    if (payload.emailVerified) key['emailVerified'] = payload.emailVerified
    if (payload.device) key['device'] = payload.device
    if (payload.lock) key['lock'] = payload.lock
    if (payload.level) key['level'] = payload.level
    if (payload.dob) key['dob'] = payload.dob
    if (payload.firstName) key['firstName'] = payload.firstName
    if (payload.lastName) key['lastName'] = payload.lastName
    if (payload.username) key['username'] = payload.username
    if (payload.email) key['email'] = payload.email
    if (payload.agreedToTerms) key['agreedToTerms'] = payload.agreedToTerms
    if (payload.lastLoginDate) key['lastLoginDate'] = new Date(payload.lastLoginDate)
    if (payload.createdAt) key['createdAt'] = payload.createdAt
    if (payload.isWaitList) key['isWaitList'] = payload.isWaitList
    if (payload.isSwitchaMerchant) key['isSwitchaMerchant'] = payload.isSwitchaMerchant


    return key
  }
  
  async getAllUsers(payload: IGetUsers) {
    try {
      const { q, perpage, page, dateFrom, dateTo, sortBy, orderBy } = payload
      if (q) {
        const { data, pagination } = await this.data.users.search({
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
          message: "User retrieved successfully",
          data,
          pagination,
        };
      }

      const cleanedPayload = this.cleanUserQueryPayload(payload)
      console.log("CLEANED PAYLOAD", cleanedPayload)
      const { data, pagination } = await this.data.users.findAllWithPagination({
        query: cleanedPayload,
        queryFields: {},
      });

      return {
        status: 200,
        state: ResponseState.SUCCESS,
        message: "Users retrieved successfully",
        data,
        pagination,
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

  async getUser(id: Types.ObjectId) {
    try {
      const data = await this.data.users.findOne({ _id: id });
      if (!data) {
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: 'User does not exist',
          error: null
        })
      };
      return {
        status: 200,
        message: "User retrieved successfully",
        data,
        state: ResponseState.SUCCESS,

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

}



