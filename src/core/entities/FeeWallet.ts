import { BLOCKCHAIN_NETWORK, WALLET_STATUS } from "./wallet.entity";

export class FeeWallet {
  balance?: number;
  lockedBalance?: number;
  address?: string;
  userId?: string;
  accountId?: string;
  network?: BLOCKCHAIN_NETWORK;
  coin?: string;
  status?: WALLET_STATUS;
  lastDeposit?: number;
  lastWithdrawal?: number;
  reference?: string
  isBlocked?: boolean;
  destinationTag?: string;
  memo?: string;
  tatumMessage?: string;
  xpub?: string;
  derivationKey?: number;
  privateKey?: string
}