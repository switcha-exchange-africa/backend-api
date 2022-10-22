import { P2pAdsType } from "./P2pAds"

export class P2pAdBank {
  name: string
  code: string
  accountName: string
  accountNumber: string
  isActive: boolean
  isWillingToPayTo: boolean
  isAcceptingToPaymentTo: boolean
  userId: string;
  type: P2pAdsType;

}
