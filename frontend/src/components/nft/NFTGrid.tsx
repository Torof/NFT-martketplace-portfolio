"use client";

import { NFTCard } from "./NFTCard";
import type { Address } from "viem";

interface NFTItem {
  contract: Address;
  tokenId: string;
  name: string;
  image: string;
  price?: bigint;
  seller?: Address;
}

interface NFTGridProps {
  items: NFTItem[];
  emptyMessage?: string;
}

export function NFTGrid({ items, emptyMessage = "No NFTs found" }: NFTGridProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <NFTCard
          key={`${item.contract}-${item.tokenId}`}
          contract={item.contract}
          tokenId={item.tokenId}
          name={item.name}
          image={item.image}
          price={item.price}
          seller={item.seller}
        />
      ))}
    </div>
  );
}
