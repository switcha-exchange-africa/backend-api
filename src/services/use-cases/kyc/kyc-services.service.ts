import { IDataServices } from "src/core/abstracts";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import { Types } from "mongoose";
import { KycFactoryService } from "./kyc-factory.service";
import { IGetKyc, IKyc } from "src/core/dtos/kyc";

@Injectable()
export class KycServices {
  constructor(
    private data: IDataServices,
    private factory: KycFactoryService
  ) { }


  async kyc(payload: IKyc) {
    try {
      const factory = await this.factory.create(payload)
      const data = await this.data.kyc.create(factory)

      return Promise.resolve({
        message: "Kyc created successfully",
        status: 200,
        data,
      });

    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
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
        status: 200,
        data,
        pagination,
      });

    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }

  async getSingleKyc(id: Types.ObjectId) {
    try {

      const data = await this.data.kyc.findOne({ _id: id });
      return Promise.resolve({
        message: "Kyc retrieved succesfully",
        status: 200,
        data,
      });

    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }
}
