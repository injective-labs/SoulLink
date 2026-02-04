import React from 'react';
import type { NFTData } from '../types';

interface NFTCardProps {
  nft: NFTData;
}

export const NFTCard: React.FC<NFTCardProps> = ({ nft }) => {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 text-center group hover:border-black transition-colors">
      <div className="w-full aspect-square bg-gradient-to-br from-black to-[#1a1a1a] rounded-xl mb-4 flex items-center justify-center text-7xl shadow-lg">
        🥷
      </div>
      <h3 className="text-lg font-bold mb-1">{nft.name}</h3>
      <span className="inline-block px-3 py-1 bg-gray-200 rounded-md text-[10px] font-mono font-medium">
        ID: #{nft.tokenId}
      </span>
    </div>
  );
};
