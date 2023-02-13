import { IDataServices } from "src/core/abstracts";
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { IBank, IGetBank, IGetSingleBank, IUpdateBank } from "src/core/dtos/bank";
import { ResponseState, ResponsesType } from "src/core/types/response";
import { Bank } from "src/core/entities/Bank";
import { IErrorReporter } from "src/core/types/error";
import { UtilsServices } from "../utils/utils.service";

@Injectable()
export class BankServices {
  constructor(
    private data: IDataServices,
    private readonly utilsService: UtilsServices
  ) { }
  cleanQueryPayload(payload: IGetBank) {
    let key = {}
    if (payload.userId) key['userId'] = payload.userId
    if (payload.perpage) key['perpage'] = payload.perpage
    if (payload.page) key['page'] = payload.page
    if (payload.dateFrom) key['dateFrom'] = payload.dateFrom
    if (payload.dateTo) key['dateTo'] = payload.dateTo
    if (payload.sortBy) key['sortBy'] = payload.sortBy
    if (payload.orderBy) key['orderBy'] = payload.orderBy
    if (payload.name) key['name'] = payload.name
    if (payload.code) key['code'] = payload.code

    return key
  }
  async create(payload: IBank): Promise<ResponsesType<Bank>> {
    try {
      const { accountNumber } = payload
      const bankExists = await this.data.banks.findOne({ accountNumber })
      if (bankExists) {
        return Promise.reject({
          status: HttpStatus.CONFLICT,
          state: ResponseState.ERROR,
          message: 'Account number already exists',
          error: null
        })
      }
      const data = await this.data.banks.create(payload);

      return {
        message: "Bank created successfully",
        status: HttpStatus.CREATED,
        data,
        state: ResponseState.SUCCESS
      };
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'CREATE BANK',
        error,
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

  async findAllWithPagination(payload: IGetBank): Promise<ResponsesType<Bank>> {
    try {
      const cleanedPayload = this.cleanQueryPayload(payload)
      console.log(cleanedPayload)
      const { data, pagination } = await this.data.banks.findAllWithPagination({
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
        message: "Bank retrieved successfully",
        status: HttpStatus.OK,
        data,
        pagination,
        state: ResponseState.SUCCESS,
      });

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'GET USER BANK',
        error,
        email: payload.userId,
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



  async getSingleBank(payload: IGetSingleBank): Promise<ResponsesType<Bank>> {
    const { userId, email, id } = payload
    try {

      const data = await this.data.banks.findOne({ _id: id, userId });
      if (!data) {
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: 'Bank does not exists',
          error: null
        })
      }
      return {
        message: "Bank retrieved successfully",
        status: HttpStatus.OK,
        data,
        state: ResponseState.SUCCESS
      };
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'GET SINGLE BANK',
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

  async deleteBank(payload: IGetSingleBank): Promise<ResponsesType<Bank>> {
    const { userId, email, id } = payload
    try {

      await this.data.banks.delete({ _id: id, userId });

      return {
        message: "Bank deleted successfully",
        status: HttpStatus.OK,
        data: {},
        state: ResponseState.SUCCESS
      };
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'DELETE BANK',
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

  async updateBank(payload: IUpdateBank) {
    const { email, id, name, code, branch, accountName, accountNumber } = payload
    try {

      await this.data.banks.update({ _id: id }, {
        name, code, branch, accountName, accountNumber
      });

      return {
        message: "Bank updated successfully",
        status: HttpStatus.OK,
        data: {},
        state: ResponseState.SUCCESS
      };
    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'Update BANK',
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
}
