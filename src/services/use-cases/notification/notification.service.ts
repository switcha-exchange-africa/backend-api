import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { IDataServices } from "src/core/abstracts";

@Injectable()
export class NotificationServices {
  constructor(
    private data: IDataServices,

  ) { }

  async getAllNotifications(payload: { query: any, userId: string }) {
    try {

      const { query, userId } = payload
      const { data, pagination } = await this.data.notifications.findAllWithPagination({
        query,
        queryFields: { userId: userId },
      });
      return { message: "Notification received successfully", data, pagination, status: HttpStatus.OK }

    } catch (error) {
      Logger.error(error)
      if (error.name === 'TypeError') return Promise.resolve({ message: error.message, status: 200 })
      return Promise.resolve({ message: error, status: 200 })
    }
  }


  async detail(id: string) {
    try {

      const data = await this.data.notifications.findOne({ id });
      return { message: "Notification received successfully", data, status: HttpStatus.OK }

    } catch (error) {
      Logger.error(error)
      if (error.name === 'TypeError') return Promise.resolve({ message: error.message, status: 200 })
      return Promise.resolve({ message: error, status: 200 })
    }
  }



}

