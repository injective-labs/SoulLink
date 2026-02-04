export interface NFTData {
  tokenId: string;
  name: string;
}

export interface BindingRecord {
  address: string;
  passkeyId: string;
  credentialId?: string;
  publicKey?: string;
  timestamp: number;
  txHash: string;
}

export type AppStep = 'connect' | 'nft' | 'verified';

// Ensure this file is treated as a module even if only types are exported
export const TYPES_MARKER = true;

