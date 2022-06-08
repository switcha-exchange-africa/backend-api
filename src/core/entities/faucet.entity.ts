import { CoinType } from "./wallet.entity";

export class Faucet {
  amount: number;
  coin: CoinType | string
  description: string
  balance?: number
  userId: string
  lastDeposit?: number
  lastWithdrawal?: number
  createdAt?: Date
  updatedAt?: Date
  
}


