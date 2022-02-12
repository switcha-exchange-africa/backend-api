import { Injectable } from "@nestjs/common";
import { IInMemoryServices } from "src/core/abstracts/in-memory.abstract";


@Injectable()
export class RedisService implements IInMemoryServices {
  set?(key: string, value: any, expiry: number) {
    throw new Error("Method not implemented.");
  }
  get(key: string) {
    throw new Error("Method not implemented.");
  }
  del(key: string) {
    throw new Error("Method not implemented.");
  }

}

