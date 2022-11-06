import { Status } from "../types/status";

export class TradeDispute {
  userId: string;
  tradeId: string
  disputeId: string
  messages: string[];
  resolvedBy: string
  resolveAdminBy: string
  status: Status
  buyer: string;
  seller: string;

}

