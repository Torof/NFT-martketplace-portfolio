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
      <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors group">
        <div className="aspect-square relative bg-gray-800">
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
            <div className="w-full h-full flex items-center justify-center text-gray-600">
              No Image
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-white truncate">{name}</h3>
          {seller && (
            <p className="text-sm text-gray-400 mt-1 truncate">
              {seller.slice(0, 6)}...{seller.slice(-4)}
            </p>
          )}
          {price !== undefined && (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-gray-400">Price</span>
              <span className="font-medium text-white">
                {formatEther(price)} ETH
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
