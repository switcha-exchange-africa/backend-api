import { HttpStatus, Injectable } from '@nestjs/common';
import { IDataServices } from 'src/core/abstracts';
import * as _ from "lodash"
import { WebPushFactoryService } from './web-push-factory.service';
import { IWebPush } from 'src/core/dtos/web-push';

@Injectable()
export class WebPushServices {
  constructor(
    private readonly data: IDataServices,
    private readonly webPushFactory: WebPushFactoryService
  ) { }




  /**
   * Promise.all affects mongo db transactions
   */
  async subscribe(payload: IWebPush) {
    try {
      const {
        key,
        userId,
        endpoint,
        expirationTime
      } = payload

      const webPushExists = await this.data.webPush.findOne({ _id: userId })
      if (webPushExists) {
        await this.data.webPush.update({ _id: userId }, {
          key,
          userId,
          endpoint,
          expirationTime
        })
        return {
          message: "Subscribed successfully",
          data: {},
          status: HttpStatus.OK
        }
      }

      const factory = await this.webPushFactory.create(payload)
      await this.data.webPush.create(factory)
      return {
        message: "Subscribed successfully",
        data: {},
        status: HttpStatus.CREATED
      }
    } catch (error) {
      throw new Error(error)
    }
  }

}


