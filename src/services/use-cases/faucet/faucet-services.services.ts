import { IDataServices } from "src/core/abstracts";
import { HttpException, Injectable, Logger } from "@nestjs/common";
import { FaucetFactoryServices } from "./faucet-factory.services";
import { FaucetDto } from "src/core/dtos/wallet/faucet.dto";

@Injectable()
export class FaucetServices {
  constructor(
    private dataServices: IDataServices,
    private faucetFactoryServices: FaucetFactoryServices
  ) {}

  async create(body: FaucetDto) {
    try {
      const faucet = await this.faucetFactoryServices.create(body);
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
