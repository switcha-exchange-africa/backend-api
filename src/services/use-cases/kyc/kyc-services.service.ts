import { IDataServices } from "src/core/abstracts";
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Types } from "mongoose";
import { KycFactoryService } from "./kyc-factory.service";
import { IGetKyc, IKycLevelThree, IKycLevelTwo, IProcessKyc } from "src/core/dtos/kyc";
import { ResponseState } from "src/core/types/response";
import { IErrorReporter } from "src/core/types/error";
import { UtilsServices } from "../utils/utils.service";
import { USER_LEVEL_TYPE } from "src/lib/constants";
import { Status } from "src/core/types/status";

@Injectable()
export class KycServices {
  constructor(
    private data: IDataServices,
    private factory: KycFactoryService,
    private readonly utilsService: UtilsServices
  ) { }


  async levelTwo(payload: IKycLevelTwo) {
    const { userId, email } = payload
    console.log(payload)
    try {
      const kyc = await this.data.kyc.findOne({
        userId,
        level: USER_LEVEL_TYPE.TWO,
          $or: [
            { status: Status.APPROVED },
            { status: Status.PENDING },

          ]

      })
      if (kyc) {
        return Promise.resolve({
          message: "Kyc already processing",
          status: HttpStatus.ACCEPTED,
          data: kyc,
        });
      }
      const factory = await this.factory.create({
        ...payload,
        level: USER_LEVEL_TYPE.TWO,

      })
      const data = await this.data.kyc.create(factory)

      return Promise.resolve({
        message: "Kyc created successfully",
        status: HttpStatus.CREATED,
        data,
      });

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'LEVEL TWO KYC',
        error,
        message: error.message
      }

      this.utilsService.errorReporter(errorPayload)
      return Promise.reject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        state: ResponseState.ERROR,
        email,
        message: error.message,
        error: error
      })
    }
  }
  async levelThree(payload: IKycLevelThree) {
    const { userId, email } = payload

    try {
      const kyc = await this.data.kyc.findOne({
        userId,
        level: USER_LEVEL_TYPE.THREE,
        $or: [
          { status: Status.APPROVED },
          { status: Status.PENDING },

        ]

      })
      if (kyc) {
        return Promise.resolve({
          message: "Kyc already processing",
          status: HttpStatus.ACCEPTED,
          data: kyc,
        });
      }
      const factory = await this.factory.create({
        ...payload,
        level: USER_LEVEL_TYPE.THREE,

      })
      const data = await this.data.kyc.create(factory)

      return Promise.resolve({
        message: "Kyc created successfully",
        status: HttpStatus.CREATED,
        data,
      });


    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'LEVEL 3 KYC',
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

  cleanQueryPayload(payload: IGetKyc) {
    let key = {}
    if (payload.perpage) key['perpage'] = payload.perpage
    if (payload.page) key['page'] = payload.page
    if (payload.dateFrom) key['dateFrom'] = payload.dateFrom
    if (payload.dateTo) key['dateTo'] = payload.dateTo
    if (payload.sortBy) key['sortBy'] = payload.sortBy
    if (payload.orderBy) key['orderBy'] = payload.orderBy
    if (payload.userId) key['userId'] = payload.userId
    if (payload.status) key['status'] = payload.status
    if (payload.level) key['level'] = payload.level

    return key
  }

  async getAllKyc(payload: IGetKyc) {
    try {
      const { q, perpage, page, dateFrom, dateTo, sortBy, orderBy } = payload
      if (q) {
        const { data, pagination } = await this.data.kyc.search({
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
          message: "Kyc retrieved successfully",
          data,
          pagination,
        };
      }
      const cleanedPayload = this.cleanQueryPayload(payload)

      const { data, pagination } = await this.data.kyc.findAllWithPagination({
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

  async processKyc(payload: IProcessKyc) {
    try {
      const { id, status } = payload
      const data = await this.data.kyc.findOne({ _id: id });
      if (!data) {
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: 'Kyc does not exists',
          error: null
        })
      }
      if (status === Status.DENIED) {
        await this.data.kyc.update({ _id: id }, { status: Status.DENIED })
        return Promise.resolve({
          message: `${status} successfully`,
          status: HttpStatus.OK,
          data,
        });
      }
      if (status === Status.PROCESSING) {
        await this.data.kyc.update({ _id: id }, { status: Status.DENIED })
        return Promise.resolve({
          message: `${status} successfully`,
          status: HttpStatus.OK,
          data,
        });
      }
      if (status === Status.APPROVED) {
        await this.data.kyc.update({ _id: id }, { status: Status.APPROVED })
        await this.data.users.update({ _id: data.userId }, { level: data.level })
        return Promise.resolve({
          message: `${status} successfully`,
          status: HttpStatus.OK,
          data,
        });
      }
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
