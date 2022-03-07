import { UserWalletInformation, WALLET_NETWORK, COIN_TYPES, WALLET_STATUS } from './../../lib/constants';
export class Wallet{
   
    balance: number;
  
    userId: string;
  
    user: UserWalletInformation;
  
    walletNetwork: WALLET_NETWORK;
  
    coinType: COIN_TYPES;
  
    walletStatus: WALLET_STATUS;

    lastDeposit: number;
  
    lastWithdrawal: number;

    createdAt: Date;
  
    updatedAt: Date;
  
    isBlocked: boolean;
}