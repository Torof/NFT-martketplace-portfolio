"use client";

import { use, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { type Address, formatEther } from "viem";
import {
  getNFTsForCollection,
  getContractMetadata,
  getAlchemyImageUrl,
  getAlchemyNFTName,
  type AlchemyNFT,
  type AlchemyCollection,
} from "@/lib/alchemy";
import { useListings } from "@/hooks/useListings";

interface PageProps {
  params: Promise<{
    address: string;
  }>;
}

interface CollectionNFT {
  contract: Address;
  tokenId: string;
  name: string;
  image: string;
  price?: bigint;
  seller?: Address;
}

export default function CollectionPage({ params }: PageProps) {
  const { address } = use(params);
  const contractAddress = address as Address;

  const [collection, setCollection] = useState<AlchemyCollection | null>(null);
  const [nfts, setNfts] = useState<CollectionNFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextToken, setNextToken] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);

  // Get marketplace listings to check which NFTs are for sale
  const { listings } = useListings();

  // Create a map of listings for quick lookup
  const listingsMap = useMemo(() => {
    const map = new Map<string, { price: bigint; seller: Address }>();
    for (const listing of listings) {
      if (listing.contract.toLowerCase() === contractAddress.toLowerCase()) {
        map.set(listing.tokenId, { price: listing.price, seller: listing.seller });
      }
    }
    return map;
  }, [listings, contractAddress]);

  // Merge NFTs with listing data
  const nftsWithListings = useMemo(() => {
    return nfts.map((nft) => {
      const listing = listingsMap.get(nft.tokenId);
      return {
        ...nft,
        price: listing?.price,
        seller: listing?.seller,
      };
    });
  }, [nfts, listingsMap]);

  // Fetch collection metadata and initial NFTs
  useEffect(() => {
    async function fetchCollection() {
      setIsLoading(true);

      try {
        // Fetch collection metadata
        const metadata = await getContractMetadata(contractAddress);
        setCollection(metadata);

        // Fetch initial NFTs
        const { nfts: collectionNfts, nextToken: token } =
          await getNFTsForCollection(contractAddress);

        const formattedNFTs: CollectionNFT[] = collectionNfts.map(
          (nft: AlchemyNFT) => ({
            contract: nft.contract.address as Address,
            tokenId: nft.tokenId,
            name: getAlchemyNFTName(nft),
            image: getAlchemyImageUrl(nft),
          })
        );

        setNfts(formattedNFTs);
        setNextToken(token);
      } catch (error) {
        console.error("Error fetching collection:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCollection();
  }, [contractAddress]);

  // Load more NFTs
  const loadMore = async () => {
    if (!nextToken || loadingMore) return;

    setLoadingMore(true);
    try {
      const { nfts: moreNfts, nextToken: token } = await getNFTsForCollection(
        contractAddress,
        nextToken
      );

      const formattedNFTs: CollectionNFT[] = moreNfts.map(
        (nft: AlchemyNFT) => ({
          contract: nft.contract.address as Address,
          tokenId: nft.tokenId,
          name: getAlchemyNFTName(nft),
          image: getAlchemyImageUrl(nft),
        })
      );

      setNfts((prev) => [...prev, ...formattedNFTs]);
      setNextToken(token);
    } catch (error) {
      console.error("Error loading more NFTs:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-40 bg-[var(--card)] rounded-2xl mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="bg-[var(--card)] rounded-xl overflow-hidden border border-[var(--border)]"
              >
                <div className="aspect-square bg-[var(--card-hover)]" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-[var(--card-hover)] rounded w-3/4" />
                  <div className="h-3 bg-[var(--card-hover)] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Collection Header */}
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 mb-8 shadow-[var(--shadow-md)]">
        <div className="flex items-start gap-6">
          {/* Collection Image */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-3xl font-bold shrink-0">
            {collection?.name?.charAt(0) || "?"}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold truncate">
              {collection?.name || "Unknown Collection"}
            </h1>
            <p className="text-[var(--muted)] text-sm mt-1 font-mono">
              {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
            </p>

            {collection?.openSeaMetadata?.description && (
              <p className="text-[var(--muted)] text-sm mt-3 line-clamp-2">
                {collection.openSeaMetadata.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex gap-6 mt-4">
              <div>
                <p className="text-lg font-bold">{nfts.length}+</p>
                <p className="text-xs text-[var(--muted)]">Items</p>
              </div>
              {collection?.openSeaMetadata?.floorPrice && (
                <div>
                  <p className="text-lg font-bold">
                    {collection.openSeaMetadata.floorPrice} ETH
                  </p>
                  <p className="text-xs text-[var(--muted)]">Floor Price</p>
                </div>
              )}
              <div>
                <p className="text-lg font-bold">{collection?.tokenType || "ERC721"}</p>
                <p className="text-xs text-[var(--muted)]">Type</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NFT Grid */}
      {nftsWithListings.length === 0 ? (
        <div className="text-center py-12 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
          <p className="text-[var(--muted)]">No NFTs found in this collection</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {nftsWithListings.map((nft) => (
              <Link
                key={`${nft.contract}-${nft.tokenId}`}
                href={`/nft/${nft.contract}/${nft.tokenId}`}
                className="group"
              >
                <div className="bg-[var(--card)] rounded-xl overflow-hidden border border-[var(--border)] hover:border-blue-500/50 transition-all duration-300 group-hover:-translate-y-1 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]">
                  <div className="aspect-square relative bg-[var(--card-hover)] overflow-hidden">
                    {nft.image ? (
                      <img
                        src={nft.image}
                        alt={nft.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--muted)] text-sm">
                        No Image
                      </div>
                    )}
                    {/* For Sale Badge */}
                    {nft.price && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-green-500/90 text-white text-xs font-medium rounded-full">
                        For Sale
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold truncate group-hover:text-blue-400 transition-colors">
                      {nft.name}
                    </h3>
                    {nft.price ? (
                      <p className="text-sm font-medium text-green-400 mt-1">
                        {formatEther(nft.price)} ETH
                      </p>
                    ) : (
                      <p className="text-xs text-[var(--muted)] mt-1">
                        Not listed
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More Button */}
          {nextToken && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-lg hover:border-blue-500/50 transition-all disabled:opacity-50"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
