export enum CardanoNetwork {
  preview = "preview",
  mainnet = "mainnet",
}

export interface IVMSettings {
  withdrawal_fee: number;
  epoch: number;
  switching_epoch: boolean;
  frontend_version: string;
  backend_version: string;
  min_balance: number;
  confirmations_required: number;
}

export interface ICSFeatures {
  claim_fee: number;
  claim_fee_whitelist: any;
  claim_enabled: boolean;
  network: string;
  ergo_enabled: boolean;
}
