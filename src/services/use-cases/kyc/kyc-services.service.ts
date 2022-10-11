import { IDataServices } from "src/core/abstracts";
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Types } from "mongoose";
import { KycFactoryService } from "./kyc-factory.service";
import { IGetKyc, IKyc } from "src/core/dtos/kyc";
import { ResponseState } from "src/core/types/response";
import { IErrorReporter } from "src/core/types/error";
import { UtilsServices } from "../utils/utils.service";

@Injectable()
export class KycServices {
  constructor(
    private data: IDataServices,
    private factory: KycFactoryService,
    private readonly utilsService: UtilsServices
  ) { }


  async kyc(payload: IKyc) {
    try {
      const factory = await this.factory.create(payload)
      const data = await this.data.kyc.create(factory)

      return Promise.resolve({
        message: "Kyc created successfully",
        status: HttpStatus.CREATED,
        data,
      });

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'SEND KYC',
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

  async getAllKyc(payload: IGetKyc) {
    try {
      const { data, pagination } = await this.data.kyc.findAllWithPagination({
        query: payload,
        queryFields: {},
        misc: {
          populated: {
            path: 'userId',
            select: '_id firstName lastName email phone'
          }
        }
      });

      return Promise.resolve({
        message: "Kyc retrieved successfully",
        status: HttpStatus.OK,
        data,
        pagination,
      });

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'GET KYC',
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

  async getSingleKyc(id: Types.ObjectId) {
    try {

      const data = await this.data.kyc.findOne({ _id: id });
      return Promise.resolve({
        message: "Kyc retrieved succesfully",
        status: HttpStatus.OK,
        data,
      });

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'GET SINGLE KYC',
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
}
