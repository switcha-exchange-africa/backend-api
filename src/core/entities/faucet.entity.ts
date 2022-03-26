import { COIN_TYPES } from "src/lib/constants";
export class Faucet {
  amount: number;
  coin: COIN_TYPES | string
  description: string
  balance?: number
  userId: string
  lastDeposit?: number
  lastWithdrawal?: number
  createdAt?: Date
  updatedAt?: Date
  
}


