import { P2pOrderType } from "../dtos/p2p";
import { Status } from "../types/status";

export class P2pOrder {
  merchantId: string
  clientId: string
  adId: string;
  type: P2pOrderType;
  quantity: number
  bankId: string
  status: Status
  clientAccountName: string
  clientAccountNumber: string
  clientBankName: string
  orderId: string
  price: number
  totalAmount: number
  completionTime: Date
}


