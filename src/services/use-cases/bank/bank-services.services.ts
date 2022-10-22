import { IDataServices } from "src/core/abstracts";
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { IBank } from "src/core/dtos/bank";
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

  async create(payload: IBank): Promise<ResponsesType<Bank>> {
    try {

      const banks = await this.data.banks.create(payload);

      return Promise.resolve({
        message: "Bank created successfully",
        status: HttpStatus.CREATED,
        data: banks,
        state: ResponseState.SUCCESS,

      });
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

  async findAllWithPagination(payload: { query: Record<string, any>, userId: string }): Promise<ResponsesType<Bank>> {
    try {

      const { query, userId } = payload
      const { data, pagination } = await this.data.banks.findAllWithPagination({
        query,
        queryFields: { userId: userId },
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

}
