import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { Types } from "mongoose";
import { IDataServices } from "src/core/abstracts";
import { IGetNotifications } from "src/core/dtos/notification";
import { IErrorReporter } from "src/core/types/error";
import { ResponseState } from "src/core/types/response";
import { UtilsServices } from "../utils/utils.service";

@Injectable()
export class NotificationServices {
  constructor(
    private readonly data: IDataServices,
    private readonly utilsService: UtilsServices
  ) { }

  cleanQueryPayload(payload: IGetNotifications) {
    let key = {}
    if (payload.userId) key['userId'] = payload.userId
    if (payload.perpage) key['perpage'] = payload.perpage
    if (payload.page) key['page'] = payload.page
    if (payload.dateFrom) key['dateFrom'] = payload.dateFrom
    if (payload.dateTo) key['dateTo'] = payload.dateTo
    if (payload.sortBy) key['sortBy'] = payload.sortBy
    if (payload.orderBy) key['orderBy'] = payload.orderBy
    return key
  }
  async getAllNotifications(payload: IGetNotifications) {
    try {
      const cleanedPayload = this.cleanQueryPayload(payload)
      const { data, pagination } = await this.data.notifications.findAllWithPagination({
        query: cleanedPayload,
        queryFields: {},
        misc: {
          populated: {
            path: 'userId',
            select: '_id firstName lastName email phone'
          }
        }
      })
      return { message: "Notification received successfully", data, pagination, status: HttpStatus.OK }

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'GET ALL NOTIFICATIONS',
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


  async detail(id: Types.ObjectId) {
    try {

      const data = await this.data.notifications.findOne({ id });
      return { message: "Notification received successfully", data, status: HttpStatus.OK }

    } catch (error) {
      Logger.error(error)
      const errorPayload: IErrorReporter = {
        action: 'GET SINGLE NOTIFICATION',
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


