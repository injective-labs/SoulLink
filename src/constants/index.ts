export * from './slogan';

export const NFT_CONTRACT_ADDRESS = import.meta.env.VITE_NFT_CONTRACT_ADDRESS || "";

export const INJECTIVE_TESTNET = {
  chainId: Number(import.meta.env.VITE_CHAIN_ID) || 0,
  chainIdHex: import.meta.env.VITE_CHAIN_ID_HEX || "",
  chainName: import.meta.env.VITE_CHAIN_NAME || "",
  rpcUrl: import.meta.env.VITE_RPC_URL || "",
  explorerUrl: import.meta.env.VITE_EXPLORER_URL || ""
};

export const ERC721_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)"
];
