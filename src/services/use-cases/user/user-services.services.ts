import { HttpException, Injectable, Logger } from "@nestjs/common";
import { Types } from "mongoose";
import { IDataServices } from "src/core/abstracts";
import { DoesNotExistsException } from "./exceptions";

@Injectable()
export class UserServices {
  constructor(
    private data: IDataServices,
  ) { }

  async getAllUsers(payload: Record<string, any>) {
    try {

      const { data, pagination } = await this.data.users.findAllWithPagination({
        query: payload,
        queryFields: {},
      });

      return {
        status: 200,
        message: "Users retrieved successfully",
        data,
        pagination,
      };
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }

  async getUser(id: Types.ObjectId) {
    try {
      const wallet = await this.data.users.findOne({ _id: id });
      if (!wallet) throw new DoesNotExistsException("User does not exist");
      return { status: 200, message: "User retrieved successfully", wallet };
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }

}



