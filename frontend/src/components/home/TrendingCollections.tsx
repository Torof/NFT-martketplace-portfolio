"use client";

import Link from "next/link";
import { useListings } from "@/hooks/useListings";
import { formatEther } from "viem";
import { useMemo } from "react";

interface CollectionStats {
  address: string;
  name: string;
  items: number;
  volume: bigint;
  floorPrice: bigint;
}

export function TrendingCollections() {
  const { listings, isLoading } = useListings();

  const collections = useMemo(() => {
    // Group listings by contract
    const collectionMap = new Map<string, CollectionStats>();

    for (const listing of listings) {
      const existing = collectionMap.get(listing.contract);
      if (existing) {
        existing.items += 1;
        existing.volume += listing.price;
        if (listing.price < existing.floorPrice) {
          existing.floorPrice = listing.price;
        }
      } else {
        collectionMap.set(listing.contract, {
          address: listing.contract,
          name: listing.name.split("#")[0].trim() || "Collection",
          items: 1,
          volume: listing.price,
          floorPrice: listing.price,
        });
      }
    }

    return Array.from(collectionMap.values());
  }, [listings]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800 animate-pulse"
          >
            <div className="w-16 h-16 bg-gray-800 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-800 rounded w-1/3" />
              <div className="h-3 bg-gray-800 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-900/50 rounded-2xl border border-gray-800">
        <p className="text-gray-400">No collections yet</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="hidden sm:grid grid-cols-12 gap-4 px-4 text-sm text-gray-500">
        <div className="col-span-1">#</div>
        <div className="col-span-5">Collection</div>
        <div className="col-span-2 text-right">Floor Price</div>
        <div className="col-span-2 text-right">Volume</div>
        <div className="col-span-2 text-right">Items</div>
      </div>

      {collections.map((collection, index) => (
        <Link
          key={collection.address}
          href={`/explore?search=${collection.address}`}
          className="group grid grid-cols-12 gap-4 items-center p-4 bg-gray-900/50 rounded-xl border border-gray-800 hover:border-gray-700 hover:bg-gray-900 transition-all duration-300"
        >
          <div className="col-span-1 text-gray-500 font-medium">
            {index + 1}
          </div>
          <div className="col-span-11 sm:col-span-5 flex items-center gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {collection.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                {collection.name}
              </h3>
              <p className="text-sm text-gray-500 hidden sm:block">
                {collection.address.slice(0, 6)}...{collection.address.slice(-4)}
              </p>
            </div>
          </div>
          <div className="hidden sm:block col-span-2 text-right">
            <span className="font-medium text-white">
              {formatEther(collection.floorPrice)} ETH
            </span>
          </div>
          <div className="hidden sm:block col-span-2 text-right">
            <span className="font-medium text-green-400">
              {formatEther(collection.volume)} ETH
            </span>
          </div>
          <div className="hidden sm:block col-span-2 text-right text-gray-400">
            {collection.items}
          </div>
        </Link>
      ))}
    </div>
  );
}
