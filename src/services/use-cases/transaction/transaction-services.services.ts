import { DoesNotExistsException } from "src/services/use-cases/user/exceptions";
import { IDataServices } from "src/core/abstracts";
import { HttpException, Injectable, Logger } from "@nestjs/common";

@Injectable()
export class TransactionServices {
  constructor(private dataServices: IDataServices) {}

  async findAll(userId: string) {
    try {
      const user = await this.dataServices.users.findOne({ _id: userId });
      if (!user) throw new DoesNotExistsException("user does not exist");
      const transactions =
        await this.dataServices.transactions.findAllWithPagination({
          query: { userId },
        });
      return Promise.resolve({
        message: "Transaction retrieved successfully",
        status: 200,
        transactions,
      });
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }

  async details(id: string) {
    try {
      const details =
        await this.dataServices.transactions.findAllWithPagination({
          query: { _id: id },
        });
      return Promise.resolve({
        message: "Transaction Details retrieved succesfully",
        status: 200,
        details,
      });
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }
}
