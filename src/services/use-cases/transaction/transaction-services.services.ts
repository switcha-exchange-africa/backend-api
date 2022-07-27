import { IDataServices } from "src/core/abstracts";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import { Types } from "mongoose";

@Injectable()
export class TransactionServices {
  constructor(private data: IDataServices) { }

  async getAllTransactions(payload: { perpage: string, page: string, dateFrom: string, dateTo: string, sortBy: string, orderBy: string, userId: string }) {
    try {

      const { data, pagination } = await this.data.transactions.findAllWithPagination({
        query: payload,
        queryFields: {},
      });

      return Promise.resolve({
        message: "Transaction retrieved successfully",
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

  async getSingleTransaction(id: Types.ObjectId) {
    try {

      const data = await this.data.transactions.findOne({ _id: id });
      return Promise.resolve({
        message: "Transaction Details retrieved succesfully",
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
