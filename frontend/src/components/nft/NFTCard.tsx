"use client";

import Image from "next/image";
import Link from "next/link";
import { formatEther } from "viem";
import type { Address } from "viem";

interface NFTCardProps {
  contract: Address;
  tokenId: string;
  name: string;
  image: string;
  price?: bigint;
  seller?: Address;
}

export function NFTCard({
  contract,
  tokenId,
  name,
  image,
  price,
  seller,
}: NFTCardProps) {
  const isDataUri = image?.startsWith("data:");

  return (
    <Link href={`/nft/${contract}/${tokenId}`}>
      <div className="bg-[var(--card)] rounded-xl overflow-hidden border border-[var(--border)] hover:border-blue-500/50 transition-all duration-300 group hover:-translate-y-2 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]">
        <div className="aspect-square relative bg-[var(--card-hover)]">
          {image ? (
            isDataUri ? (
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
              No Image
            </div>
          )}
          {/* For Sale Badge */}
          {price !== undefined && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-green-500/90 text-white text-xs font-medium rounded-full">
              For Sale
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold truncate">{name}</h3>
          {seller && (
            <p className="text-sm text-[var(--muted)] mt-1 truncate">
              {seller.slice(0, 6)}...{seller.slice(-4)}
            </p>
          )}
          {price !== undefined && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-[var(--muted)]">Price</span>
              <span className="font-medium">
                {formatEther(price)} ETH
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
