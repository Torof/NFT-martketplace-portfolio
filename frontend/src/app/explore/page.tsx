"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { NFTGrid } from "@/components/nft/NFTGrid";
import { useListings } from "@/hooks/useListings";

type SortOption = "recent" | "price-low" | "price-high";

function ExploreContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const { listings, isLoading } = useListings();

  const filteredAndSortedListings = useMemo(() => {
    let result = [...listings];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.contract.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => (a.price < b.price ? -1 : 1));
        break;
      case "price-high":
        result.sort((a, b) => (a.price > b.price ? -1 : 1));
        break;
      case "recent":
      default:
        // Keep original order (most recent first from events)
        break;
    }

    return result;
  }, [listings, searchQuery, sortBy]);

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          {searchQuery && (
            <div className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm">
              Search: "{searchQuery}"
            </div>
          )}
          <span className="text-gray-400 text-sm">
            {filteredAndSortedListings.length} items
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-gray-400 text-sm">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="recent">Recently Listed</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-600 border-t-blue-500" />
          <p className="text-gray-400 mt-4">Loading listings...</p>
        </div>
      ) : (
        <NFTGrid
          items={filteredAndSortedListings}
          emptyMessage={
            searchQuery
              ? `No NFTs found for "${searchQuery}"`
              : "No NFTs listed yet. Be the first to list!"
          }
        />
      )}
    </>
  );
}

export default function ExplorePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Explore NFTs</h1>
        <p className="text-gray-400 mt-2">
          Discover and collect extraordinary NFTs
        </p>
      </div>

      <Suspense
        fallback={
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-600 border-t-blue-500" />
            <p className="text-gray-400 mt-4">Loading...</p>
          </div>
        }
      >
        <ExploreContent />
      </Suspense>
    </div>
  );
}
