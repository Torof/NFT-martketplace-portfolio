"use client";

import Link from "next/link";
import Image from "next/image";
import { useListings } from "@/hooks/useListings";
import { formatEther, type Address } from "viem";
import { useMemo, useState, useEffect } from "react";
import { getContractMetadata, getNFTMetadata, getAlchemyImageUrl } from "@/lib/alchemy";

interface CollectionStats {
  address: string;
  name: string;
  items: number;
  volume: bigint;
  floorPrice: bigint;
}

// Gradient colors for collections without images
const GRADIENTS = [
  "from-amber-500 to-orange-600",
  "from-pink-500 to-rose-600",
  "from-cyan-400 to-blue-500",
  "from-yellow-400 to-pink-500",
  "from-purple-500 to-violet-600",
  "from-emerald-500 to-teal-600",
  "from-indigo-500 to-purple-600",
  "from-lime-500 to-green-600",
  "from-fuchsia-500 to-pink-500",
  "from-blue-500 to-indigo-600",
];

function CollectionImage({
  contractAddress,
  name,
  index
}: {
  contractAddress: string;
  name: string;
  index: number;
}) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const gradient = GRADIENTS[index % GRADIENTS.length];

  useEffect(() => {
    let cancelled = false;

    async function fetchImage() {
      try {
        // First try to get collection image from contract metadata
        const contractMeta = await getContractMetadata(contractAddress as Address);
        if (!cancelled && contractMeta?.openSeaMetadata?.imageUrl) {
          setImageUrl(contractMeta.openSeaMetadata.imageUrl);
          setIsLoading(false);
          return;
        }

        // Fall back to NFT #1 (or #0) image
        let nft = await getNFTMetadata(contractAddress as Address, "1");
        if (!nft) {
          nft = await getNFTMetadata(contractAddress as Address, "0");
        }

        if (!cancelled && nft) {
          const url = getAlchemyImageUrl(nft);
          if (url) {
            setImageUrl(url);
          }
        }
      } catch (err) {
        console.error("Error fetching collection image:", err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchImage();
    return () => { cancelled = true; };
  }, [contractAddress]);

  if (isLoading) {
    return (
      <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white font-bold text-lg animate-pulse`}>
        {name.charAt(0)}
      </div>
    );
  }

  if (!imageUrl || hasError) {
    return (
      <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white font-bold text-lg`}>
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden relative bg-[var(--surface)]">
      <Image
        src={imageUrl}
        alt={name}
        fill
        className="object-cover"
        onError={() => setHasError(true)}
        unoptimized
      />
    </div>
  );
}

export function TrendingCollections() {
  const { listings, isLoading } = useListings();

  const collections = useMemo(() => {
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
            className="flex items-center gap-4 p-4 bg-[var(--card)] rounded-xl border border-[var(--border)] animate-pulse shadow-[var(--shadow-sm)]"
          >
            <div className="w-16 h-16 bg-[var(--card-hover)] rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[var(--card-hover)] rounded w-1/3" />
              <div className="h-3 bg-[var(--card-hover)] rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="text-center py-12 bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-md)]">
        <p className="text-[var(--muted)]">No collections yet</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {/* Header */}
      <div className="hidden sm:grid grid-cols-12 gap-4 px-4 text-sm text-[var(--muted)]">
        <div className="col-span-1">#</div>
        <div className="col-span-5">Collection</div>
        <div className="col-span-2 text-right">Floor Price</div>
        <div className="col-span-2 text-right">Volume</div>
        <div className="col-span-2 text-right">Items</div>
      </div>

      {collections.map((collection, index) => (
        <Link
          key={collection.address}
          href={`/collection/${collection.address}`}
          className="group grid grid-cols-12 gap-4 items-center p-4 bg-[var(--card)] rounded-xl border border-[var(--border)] hover:border-blue-500/50 hover:bg-[var(--card-hover)] transition-all duration-300 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]"
        >
          <div className="col-span-1 text-[var(--muted)] font-medium">
            {index + 1}
          </div>
          <div className="col-span-11 sm:col-span-5 flex items-center gap-4">
            <CollectionImage
              contractAddress={collection.address}
              name={collection.name}
              index={index}
            />
            <div>
              <h3 className="font-semibold group-hover:text-blue-400 transition-colors">
                {collection.name}
              </h3>
              <p className="text-sm text-[var(--muted)] hidden sm:block">
                {collection.address.slice(0, 6)}...{collection.address.slice(-4)}
              </p>
            </div>
          </div>
          <div className="hidden sm:block col-span-2 text-right">
            <span className="font-medium">
              {formatEther(collection.floorPrice)} ETH
            </span>
          </div>
          <div className="hidden sm:block col-span-2 text-right">
            <span className="font-medium text-green-400">
              {formatEther(collection.volume)} ETH
            </span>
          </div>
          <div className="hidden sm:block col-span-2 text-right text-[var(--muted)]">
            {collection.items}
          </div>
        </Link>
      ))}
    </div>
  );
}
