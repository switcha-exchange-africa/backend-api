import { IDataServices } from "src/core/abstracts";
import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { ResponseState, ResponsesType } from "src/core/types/response";
import { Activity } from "src/core/entities/Activity";
import { IGetActivities } from "src/core/dtos/activity";

@Injectable()
export class ActivityServices {
  constructor(private data: IDataServices) { }

  cleanQueryPayload(payload: IGetActivities) {
    let key = {}
    if (payload.userId) key['userId'] = payload.userId
    if (payload.perpage) key['perpage'] = payload.perpage
    if (payload.page) key['page'] = payload.page
    if (payload.dateFrom) key['dateFrom'] = payload.dateFrom
    if (payload.dateTo) key['dateTo'] = payload.dateTo
    if (payload.sortBy) key['sortBy'] = payload.sortBy
    if (payload.orderBy) key['orderBy'] = payload.orderBy
    if (payload.userId) key['userId'] = payload.userId
    if (payload.action) key['action'] = payload.action

    return key
  }
  async getAllActivities(payload: IGetActivities): Promise<ResponsesType<Activity>> {
    try {

      const cleanedPayload = this.cleanQueryPayload(payload)
      const { data, pagination } = await this.data.activities.findAllWithPagination({
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
        message: "Activities retrieved successfully",
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

}
