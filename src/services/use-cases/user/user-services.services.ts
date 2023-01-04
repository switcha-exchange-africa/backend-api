import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Types } from "mongoose";
import { IDataServices } from "src/core/abstracts";
import { IMutateUserAccount } from "src/core/dtos/authentication/login.dto";
import { IGetUsers } from "src/core/dtos/users";
import { ResponseState } from "src/core/types/response";
import databaseHelper from "src/frameworks/data-services/mongo/database-helper";
import { MutateUserFactoryService } from "./user-factory.service";
import * as mongoose from "mongoose";
import { InjectConnection } from "@nestjs/mongoose";
import { User } from "src/core/entities/user.entity";

@Injectable()
export class UserServices {
  constructor(
    private readonly data: IDataServices,
    private readonly mutateUserFactory: MutateUserFactoryService,
    @InjectConnection('switcha') private readonly connection: mongoose.Connection


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
          status: HttpStatus.OK,
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
        status: HttpStatus.OK,
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
        status: HttpStatus.OK,
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

  async disable(payload: IMutateUserAccount) {
    try {
      const { id, reason } = payload

      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {
          const mutateFactory = await this.mutateUserFactory.mutate({
            userId: String(id),
            reason,
            type: 'disable'
          })

          await this.data.users.update({ _id: id }, {
            isDisabled: true,
            disabledReason: reason,
            disabledDate: new Date()
          }, session);
          await this.data.mutateUser.create(mutateFactory, session)

        } catch (error) {
          Logger.error(error);
          throw new Error(error);
        }

      }
      await databaseHelper.executeTransactionWithStartTransaction(
        atomicTransaction,
        this.connection
      )
      return {
        status: HttpStatus.OK,
        message: "User disabled successfully",
        data: {},
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



  async lock(payload: IMutateUserAccount) {
    try {
      const { id, reason } = payload


      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {
          const mutateFactory = await this.mutateUserFactory.mutate({
            userId: String(id),
            reason,
            type: 'lock'
          })

          await this.data.users.update({ _id: id }, {
            lock: true,
            lockedReason: reason,
            lockedDate: new Date()
          }, session);
          await this.data.mutateUser.create(mutateFactory, session)

        } catch (error) {
          Logger.error(error);
          throw new Error(error);
        }

      }
      await databaseHelper.executeTransactionWithStartTransaction(
        atomicTransaction,
        this.connection
      )
      return {
        status: HttpStatus.OK,
        message: "User locked successfully",
        data: {},
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

  async blacklist(payload: IMutateUserAccount) {
    try {
      const { id, reason } = payload

      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {
          const mutateFactory = await this.mutateUserFactory.mutate({
            userId: String(id),
            reason,
            type: 'blacklist'
          })

          await this.data.users.update({ _id: id }, {
            isBlacklisted: true,
            blacklistedReason: reason,
            blacklistedDate: new Date()
          }, session);
          await this.data.mutateUser.create(mutateFactory, session)

        } catch (error) {
          Logger.error(error);
          throw new Error(error);
        }

      }
      await databaseHelper.executeTransactionWithStartTransaction(
        atomicTransaction,
        this.connection
      )
      return {
        status: HttpStatus.OK,
        message: "User locked successfully",
        data: {},
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


  async addMultipleUsers(users: User[]) {
    try {
      const data = await this.data.users.create(users)
      return {
        status: HttpStatus.OK,
        message: "User uploaded successfully",
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




