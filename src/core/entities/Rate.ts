import { CryptoPairType } from "./wallet.entity";

export class ExchangeRate {

  pair: CryptoPairType;

  description: string

  userId: string;

  buyRate: number

  sellRate: number

}
