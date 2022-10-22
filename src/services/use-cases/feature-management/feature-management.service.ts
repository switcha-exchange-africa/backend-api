import { HttpStatus, Injectable, Logger } from "@nestjs/common";
import { IDataServices } from "src/core/abstracts";
import { FeatureEnum } from "src/core/dtos/activity";
import { FeatureManagement } from "src/core/entities/Feature-Management";
import { ResponseState, ResponsesType } from "src/core/types/response";

@Injectable()
export class FeatureManagementServices {
  constructor(private data: IDataServices) { }
  // cleanQueryPayload(payload: IGetWallets) {
  //   let key = {}
  //   if (payload.userId) key['userId'] = payload.userId
  //   if (payload.coin) key['coin'] = payload.coin
  //   if (payload.perpage) key['perpage'] = payload.perpage
  //   if (payload.page) key['page'] = payload.page
  //   if (payload.dateFrom) key['dateFrom'] = payload.dateFrom
  //   if (payload.dateTo) key['dateTo'] = payload.dateTo
  //   if (payload.sortBy) key['sortBy'] = payload.sortBy
  //   if (payload.orderBy) key['orderBy'] = payload.orderBy
  //   if (payload.reference) key['reference'] = payload.reference

  //   return key
  // }

  async seed(userId: string): Promise<ResponsesType<FeatureManagement[]>> {
    try {
      const seed = [
        {
          userId,
          feature: FeatureEnum.SIGNUP,
          active: true
        },
        {
          userId,
          feature: FeatureEnum.SIGNIN,
          active: true
        },
        {
          userId,
          feature: FeatureEnum.VERIFY_EMAIL,
          active: true
        },
        {
          userId,
          feature: FeatureEnum.RECOVER_PASSWORD,
          active: true
        },
        {
          userId,
          feature: FeatureEnum.RESET_PASSWORD,
          active: true
        },
        {
          userId,
          feature: FeatureEnum.WITHDRAWAL,
          active: true
        },
        {
          userId,
          feature: FeatureEnum.DEPOSIT,
          active: true
        },
        {
          userId,
          feature: FeatureEnum.SWAP,
          active: true
        },
        {
          userId,
          feature: FeatureEnum.P2P_AD,
          active: true
        },
        {
          userId,
          feature: FeatureEnum.P2P_ORDER,
          active: true
        },
        {
          userId,
          feature: FeatureEnum.QUICK_TRADE,
          active: true
        },
      ]



      const data = await this.data.featureManagement.create(seed)
      return {
        status: HttpStatus.OK,
        message: "Feature seeded successfully",
        data,
        state: ResponseState.SUCCESS
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