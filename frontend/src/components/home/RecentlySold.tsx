"use client";

import Link from "next/link";
import { formatEther } from "viem";
import { useRecentSales } from "@/hooks/useRecentSales";

export function RecentlySold() {
  const { sales, isLoading } = useRecentSales();

  if (isLoading) {
    return (
      <div className="flex justify-center gap-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-28 bg-[var(--card)] rounded-md overflow-hidden border border-[var(--border)] animate-pulse shadow-[var(--shadow-sm)]"
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

  if (sales.length === 0) {
    return (
      <div className="text-center py-8 bg-[var(--card)] rounded-xl border border-[var(--border)]">
        <p className="text-[var(--muted)] text-sm">No sales yet</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-3 flex-wrap">
      {sales.slice(0, 5).map((nft, index) => (
        <Link
          key={`${nft.contract}-${nft.tokenId}-${index}`}
          href={`/nft/${nft.contract}/${nft.tokenId}`}
          className="group w-28"
        >
          <div className="bg-[var(--card)] rounded-md overflow-hidden border border-[var(--border)] hover:border-green-500/50 transition-all duration-300 group-hover:-translate-y-1 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] relative">
            {/* Sold badge */}
            <div className="absolute top-1 right-1 z-10 bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
              SOLD
            </div>
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
              <h3 className="text-[10px] font-semibold truncate group-hover:text-green-400 transition-colors">
                {nft.name}
              </h3>
              <p className="text-[10px] text-green-400 font-medium">
                {formatEther(nft.price)} ETH
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
