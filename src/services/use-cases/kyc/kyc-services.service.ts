import { IDataServices } from "src/core/abstracts";
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import mongoose, { Types } from "mongoose";
import { KycFactoryService } from "./kyc-factory.service";
import { IGetKyc, IGetSingleKyc, IKycLevelThree, IKycLevelTwo, IProcessKyc } from "src/core/dtos/kyc";
import { ResponseState } from "src/core/types/response";
import { IErrorReporter } from "src/core/types/error";
import { UtilsServices } from "../utils/utils.service";
import { USER_LEVEL_TYPE } from "src/lib/constants";
import { Status } from "src/core/types/status";
import { NotificationFactoryService } from "../notification/notification-factory.service";
import { InjectConnection } from "@nestjs/mongoose";
import databaseHelper from "src/frameworks/data-services/mongo/database-helper";

@Injectable()
export class KycServices {
  constructor(
    private readonly data: IDataServices,
    private readonly factory: KycFactoryService,
    private readonly notificationFactory: NotificationFactoryService,
    private readonly utilsService: UtilsServices,
    @InjectConnection() private readonly connection: mongoose.Connection,

  ) { }


  async levelTwo(payload: IKycLevelTwo) {
    const { userId, email } = payload
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
        message: "Document uploaded successfully",
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
        message: "Document uploaded successfully",
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
  async getSingleKycByLevel(payload: IGetSingleKyc) {
    try {
      const { userId, level } = payload
      const data = await this.data.kyc.findOne({ userId, level });
      return Promise.resolve({
        message: "Kyc retrieved succesfully",
        status: HttpStatus.OK,
        data,
      });

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'GET SINGLE KYC BY LEVEL',
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
      const { id, status, reason } = payload
      const data = await this.data.kyc.findOne({ _id: id });
      if (!data) {
        return Promise.reject({
          status: HttpStatus.NOT_FOUND,
          state: ResponseState.ERROR,
          message: 'Kyc does not exists',
          error: null
        })
      }
      const user = await this.data.users.findOne({ _id: data.userId })


      if (status === Status.DENIED) {

        const atomicTransaction = async (session: mongoose.ClientSession) => {
          try {
            const notificationFactory = this.notificationFactory.create({
              userId: String(data.userId),
              title: `Level ${data.level} kyc document denied`,
              message: reason
            })
            await this.data.notifications.create(notificationFactory, session)
            await this.data.kyc.update({ _id: id }, { status: Status.DENIED }, session)
          } catch (error) {
            Logger.error(error);
            return Promise.reject(error)
          }
        }

        await databaseHelper.executeTransactionWithStartTransaction(
          atomicTransaction,
          this.connection
        )
        return Promise.resolve({
          message: `Verification ${status} successfully`,
          status: HttpStatus.OK,
          data,
        });
      }
      if (status === Status.PROCESSING) {
        await this.data.kyc.update({ _id: id }, { status: Status.DENIED })
        return Promise.resolve({
          message: `Verification ${status} successfully`,
          status: HttpStatus.OK,
          data,
        });
      }


      if (data.level === 'two' && user.level === 'two') {
        return {
          message: `Processed successfully`,
          status: HttpStatus.OK,
          data,
        };
      }
      if (data.level === 'three' && user.level === 'three') {
        return {
          message: `Processed successfully`,
          status: HttpStatus.OK,
          data,
        };
      }

      if (data.level === 'three' && user.level !== 'two') {
        return {
          message: `User must be in level 2 to process level 3 document`,
          status: HttpStatus.BAD_REQUEST,
          error: null,
          state: ResponseState.ERROR
        };
      }

      if (data.level === 'two' && user.level !== 'one') {
        return {
          message: `User must be in level 1 to process level 2 document`,
          status: HttpStatus.BAD_REQUEST,
          error: null,
          state: ResponseState.ERROR
        };
      }

      const atomicTransaction = async (session: mongoose.ClientSession) => {
        try {
          const notificationFactory = this.notificationFactory.create({
            userId: String(data.userId),
            title: `Level ${data.level} kyc document approved`,
            message: reason
          })
          await this.data.notifications.create(notificationFactory, session)
          await this.data.kyc.update({ _id: id }, { status: Status.APPROVED }, session)
          await this.data.users.update({ _id: data.userId }, { level: data.level }, session)
        } catch (error) {
          Logger.error(error);
          return Promise.reject(error)
        }
      }

      await databaseHelper.executeTransactionWithStartTransaction(
        atomicTransaction,
        this.connection
      )

      return Promise.resolve({
        message: `Verification ${status} successfully`,
        status: HttpStatus.OK,
        data,
      });

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'PROCESS KYC',
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
