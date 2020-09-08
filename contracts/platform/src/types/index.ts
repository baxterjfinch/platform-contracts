
export enum Currency {
  ETH,
  USDCents,
}

export interface Order {
  changeRecipient: string;
  assetRecipient: string;
  sku: string;
  quantity: number;
  currency: Currency;
  totalPrice: number;
  alreadyPaid: number;
}

export interface PaymentParams {
  nonce: number;
  escrowFor: number;
  value: number;
}

export interface Payment {
  currency: Currency;
  escrowFor: number;
  value: number;
  nonce: number;
  v: number;
  r: string;
  s: string;
}

export type EscrowReturnInfo = {
  asset: string;
  ids?: number[];
};

export declare type PlatformAddresses = {
  beaconAddress?: string;
  processorAddress?: string;
  escrowAddress?: string;
  creditCardAddress?: string;
  makerOracleAddress?: string;
  manualOracleAddress?: string;
};
