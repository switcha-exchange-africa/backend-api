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
      const transactions = await this.dataServices.transactions.find({
        userId,
      });
      if (!transactions || transactions.length === 0)
        throw new DoesNotExistsException(
          "transaction does not exist or is empty"
        );
      return transactions;
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }

  async details(id: string) {
    try {
      const details = await this.dataServices.transactions.findOne({ _id: id });
      if (!details)
        throw new DoesNotExistsException("transaction does not exist");
      return details;
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }
}
