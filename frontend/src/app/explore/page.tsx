"use client";

import { NFTGrid } from "@/components/nft/NFTGrid";
import { useListings } from "@/hooks/useListings";

export default function ExplorePage() {
  const { listings, isLoading } = useListings();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Explore NFTs</h1>
        <p className="text-gray-400 mt-2">
          Discover and collect extraordinary NFTs
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-600 border-t-blue-500" />
          <p className="text-gray-400 mt-4">Loading listings...</p>
        </div>
      ) : (
        <NFTGrid
          items={listings}
          emptyMessage="No NFTs listed yet. Be the first to list!"
        />
      )}
    </div>
  );
}
