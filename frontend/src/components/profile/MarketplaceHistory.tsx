"use client";

import Link from "next/link";
import { formatEther, type Address } from "viem";
import { useMarketplaceHistory, type EventType } from "@/hooks/useMarketplaceHistory";

interface MarketplaceHistoryProps {
  address: Address;
}

const eventConfig: Record<EventType, { label: string; color: string; icon: string }> = {
  listed: { label: "Listed", color: "text-blue-400", icon: "📋" },
  bought: { label: "Bought", color: "text-green-400", icon: "🛒" },
  sold: { label: "Sold", color: "text-purple-400", icon: "💰" },
  cancelled: { label: "Cancelled", color: "text-orange-400", icon: "❌" },
};

export function MarketplaceHistory({ address }: MarketplaceHistoryProps) {
  const { events, isLoading, error } = useMarketplaceHistory(address);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 bg-[var(--card)] rounded-xl border border-[var(--border)] animate-pulse"
          >
            <div className="w-10 h-10 bg-[var(--card-hover)] rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[var(--card-hover)] rounded w-1/3" />
              <div className="h-3 bg-[var(--card-hover)] rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
        <p className="text-[var(--muted)]">No marketplace activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const config = eventConfig[event.type];
        return (
          <Link
            key={event.id}
            href={`/nft/${event.nftContract}/${event.tokenId}`}
            className="flex items-center gap-4 p-4 bg-[var(--card)] rounded-xl border border-[var(--border)] hover:border-blue-500/50 hover:bg-[var(--card-hover)] transition-all"
          >
            <div className="w-10 h-10 bg-[var(--surface)] rounded-lg flex items-center justify-center text-xl">
              {config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-medium ${config.color}`}>
                  {config.label}
                </span>
                <span className="text-[var(--muted)] text-sm">
                  NFT #{event.tokenId}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] truncate font-mono">
                {event.nftContract.slice(0, 6)}...{event.nftContract.slice(-4)}
              </p>
            </div>
            {event.price > 0n && (
              <div className="text-right">
                <p className="font-semibold">{formatEther(event.price)} ETH</p>
              </div>
            )}
            <div className="text-[var(--muted)]">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
