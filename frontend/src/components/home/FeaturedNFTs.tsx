"use client";

import { useMemo } from "react";
import Link from "next/link";
import { formatEther } from "viem";
import { useListings } from "@/hooks/useListings";

export function FeaturedNFTs() {
  const { listings, isLoading } = useListings();

  // All hooks must be called before any early returns
  const featured = useMemo(() => {
    if (listings.length === 0) return [];

    // Filter out duplicates by contract-tokenId
    const uniqueListings = listings.filter(
      (nft, index, self) =>
        index === self.findIndex((n) => n.contract === nft.contract && n.tokenId === nft.tokenId)
    );

    if (uniqueListings.length === 0) return [];

    // Sort by price (highest first) and take top 10
    const sortedByPrice = [...uniqueListings].sort((a, b) =>
      a.price > b.price ? -1 : 1
    );
    const highestPriced = sortedByPrice.slice(0, 10);

    // Simulate "popular" NFTs using a deterministic score based on tokenId
    // (In production, this would come from view count analytics)
    const withPopularityScore = uniqueListings.map((nft) => ({
      ...nft,
      popularityScore:
        (parseInt(nft.tokenId) * 7 + nft.contract.charCodeAt(5)) % 100,
    }));
    const sortedByPopularity = [...withPopularityScore].sort(
      (a, b) => b.popularityScore - a.popularityScore
    );
    const mostPopular = sortedByPopularity.slice(0, 10);

    // Merge and deduplicate, alternating between price and popularity
    const merged: typeof uniqueListings = [];
    const seen = new Set<string>();

    for (let i = 0; i < 10; i++) {
      if (highestPriced[i]) {
        const key = `${highestPriced[i].contract}-${highestPriced[i].tokenId}`;
        if (!seen.has(key)) {
          merged.push(highestPriced[i]);
          seen.add(key);
        }
      }
      if (mostPopular[i]) {
        const key = `${mostPopular[i].contract}-${mostPopular[i].tokenId}`;
        if (!seen.has(key)) {
          merged.push(mostPopular[i]);
          seen.add(key);
        }
      }
    }

    return merged.slice(0, 20);
  }, [listings]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="bg-[var(--card)] rounded-md overflow-hidden border border-[var(--border)] animate-pulse shadow-[var(--shadow-sm)]"
          >
            <div className="aspect-square bg-[var(--card-hover)]" />
            <div className="p-1.5 space-y-1">
              <div className="h-2 bg-[var(--card-hover)] rounded w-3/4" />
              <div className="h-2 bg-[var(--card-hover)] rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (featured.length === 0) {
    return (
      <div className="text-center py-12 bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-md)]">
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

  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
      {featured.map((nft) => (
        <Link
          key={`${nft.contract}-${nft.tokenId}`}
          href={`/nft/${nft.contract}/${nft.tokenId}`}
          className="group"
        >
          <div className="bg-[var(--card)] rounded-md overflow-hidden border border-[var(--border)] hover:border-blue-500/50 transition-all duration-300 group-hover:-translate-y-1 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]">
            <div className="aspect-square relative bg-[var(--card-hover)] overflow-hidden">
              {nft.image ? (
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--muted)] text-[10px]">
                  No Image
                </div>
              )}
            </div>
            <div className="p-1.5">
              <h3 className="text-[10px] font-semibold truncate group-hover:text-blue-400 transition-colors">
                {nft.name}
              </h3>
              <p className="text-[10px] text-[var(--muted)]">
                {formatEther(nft.price)} ETH
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
