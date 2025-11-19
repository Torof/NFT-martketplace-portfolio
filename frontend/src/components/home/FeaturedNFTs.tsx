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
            className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 animate-pulse"
          >
            <div className="aspect-square bg-gray-800" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-800 rounded w-3/4" />
              <div className="h-3 bg-gray-800 rounded w-1/2" />
              <div className="h-4 bg-gray-800 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-900/50 rounded-2xl border border-gray-800">
        <p className="text-gray-400">No NFTs listed yet</p>
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
          <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-600 transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-purple-500/10">
            <div className="aspect-square relative bg-gray-800 overflow-hidden">
              {nft.image ? (
                <img
                  src={nft.image}
                  alt={nft.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  No Image
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                {nft.name}
              </h3>
              <p className="text-sm text-gray-400 mt-1 truncate">
                {nft.seller.slice(0, 6)}...{nft.seller.slice(-4)}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">Price</span>
                <span className="font-semibold text-white">
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
