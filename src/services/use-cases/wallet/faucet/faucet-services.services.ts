import { IDataServices } from "src/core/abstracts";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import { Faucet } from "src/core/entities/faucet.entity";

@Injectable()
export class FaucetServices {
  constructor(private dataServices: IDataServices) {}

  async create(faucet: Faucet) {
    try {
      const createdFaucet = await this.dataServices.faucets.create(faucet);
      return {
        message: "Faucet created successfully",
        data: createdFaucet,
        status: 200,
      };
    } catch (error) {
      Logger.error(error);
      if (error.name === "TypeError")
        throw new HttpException(error.message, 500);
      throw new Error(error);
    }
  }
}
