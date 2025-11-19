"use client";

import Link from "next/link";
import { formatEther } from "viem";
import { useListings } from "@/hooks/useListings";

export function FeaturedNFTs() {
  const { listings, isLoading } = useListings();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-[var(--card)] rounded-2xl overflow-hidden border border-[var(--border)] animate-pulse"
          >
            <div className="aspect-square bg-[var(--card-hover)]" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-[var(--card-hover)] rounded w-3/4" />
              <div className="h-3 bg-[var(--card-hover)] rounded w-1/2" />
              <div className="h-4 bg-[var(--card-hover)] rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
        <p className="text-[var(--muted)]">No NFTs listed yet</p>
        <Link
          href="/explore"
          className="inline-block mt-4 text-blue-400 hover:text-blue-300"
        >
          Be the first to list →
        </Link>
      </div>
    );
  }

  const featured = listings.slice(0, 4);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {featured.map((nft) => (
        <Link
          key={`${nft.contract}-${nft.tokenId}`}
          href={`/nft/${nft.contract}/${nft.tokenId}`}
          className="group"
        >
          <div className="bg-[var(--card)] rounded-2xl overflow-hidden border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300 group-hover:-translate-y-2">
            <div className="aspect-square relative bg-[var(--card-hover)] overflow-hidden">
              {nft.image ? (
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
                  No Image
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold truncate group-hover:text-blue-400 transition-colors">
                {nft.name}
              </h3>
              <p className="text-sm text-[var(--muted)] mt-1 truncate">
                {nft.seller.slice(0, 6)}...{nft.seller.slice(-4)}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-[var(--muted)]">Price</span>
                <span className="font-semibold">
                  {formatEther(nft.price)} ETH
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
