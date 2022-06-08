import { IDataServices } from "src/core/abstracts";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { IBank } from "src/core/dtos/bank";

@Injectable()
export class BankServices {
  constructor(private data: IDataServices) { }

  async create(payload: IBank) {
    try {

      const banks = await this.data.banks.create(payload);

      return Promise.resolve({
        message: "Bank created successfully",
        status: HttpStatus.CREATED,
        banks,
      });
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }

  async findAllWithPagination(payload: { query: Record<string, any>, userId: string }) {
    try {
      const { query, userId } = payload

      const banks =
        await this.data.banks.findAllWithPagination({
          query,
          queryFields: { userId: userId },
        });

      return Promise.resolve({
        message: "Bank retrieved successfully",
        status: HttpStatus.OK,
        banks,
      });
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }

}
