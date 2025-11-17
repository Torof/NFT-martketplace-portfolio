"use client";

import { use } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatEther, type Address } from "viem";
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI, ERC721_ABI } from "@/config/contracts";
import { BuyButton } from "@/components/marketplace/BuyButton";
import { ListingActions } from "@/components/marketplace/ListingActions";

interface PageProps {
  params: Promise<{
    contract: string;
    tokenId: string;
  }>;
}

export default function NFTDetailPage({ params }: PageProps) {
  const { contract, tokenId } = use(params);
  const { address } = useAccount();

  const nftContract = contract as Address;
  const tokenIdBigInt = BigInt(tokenId);

  // Get NFT owner
  const { data: owner } = useReadContract({
    address: nftContract,
    abi: ERC721_ABI,
    functionName: "ownerOf",
    args: [tokenIdBigInt],
  });

  // Get collection name
  const { data: collectionName } = useReadContract({
    address: nftContract,
    abi: ERC721_ABI,
    functionName: "name",
  });

  // Get listing info
  const { data: listing, refetch: refetchListing } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "getListing",
    args: [nftContract, tokenIdBigInt],
  });

  // Get token URI for metadata
  const { data: tokenURI } = useReadContract({
    address: nftContract,
    abi: ERC721_ABI,
    functionName: "tokenURI",
    args: [tokenIdBigInt],
  });

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();
  const isListed = listing?.active;
  const isSeller = address && listing?.seller && address.toLowerCase() === listing.seller.toLowerCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="aspect-square bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <div className="text-center">
              <div className="text-6xl mb-4">🖼️</div>
              <p>NFT #{tokenId}</p>
              {tokenURI && (
                <p className="text-xs mt-2 text-gray-500 break-all px-4">
                  {tokenURI.toString().slice(0, 50)}...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="flex flex-col">
          <div className="mb-2">
            <span className="text-blue-500 text-sm font-medium">
              {collectionName || "Collection"}
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-4">
            {collectionName || "NFT"} #{tokenId}
          </h1>

          <div className="flex items-center gap-2 text-gray-400 mb-6">
            <span>Owned by</span>
            <span className="text-white font-medium">
              {owner ? (
                isOwner ? (
                  "You"
                ) : (
                  `${owner.slice(0, 6)}...${owner.slice(-4)}`
                )
              ) : (
                "Loading..."
              )}
            </span>
          </div>

          {/* Price Card */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
            {isListed ? (
              <>
                <p className="text-gray-400 text-sm mb-1">Current Price</p>
                <p className="text-3xl font-bold mb-4">
                  {formatEther(listing.price)} ETH
                </p>

                {!isOwner && !isSeller && (
                  <BuyButton
                    nftContract={nftContract}
                    tokenId={tokenIdBigInt}
                    price={listing.price}
                    onSuccess={refetchListing}
                  />
                )}

                {isSeller && (
                  <ListingActions
                    nftContract={nftContract}
                    tokenId={tokenIdBigInt}
                    currentPrice={listing.price}
                    onSuccess={refetchListing}
                  />
                )}
              </>
            ) : (
              <>
                <p className="text-gray-400 mb-4">Not listed for sale</p>
                {isOwner && (
                  <ListingActions
                    nftContract={nftContract}
                    tokenId={tokenIdBigInt}
                    onSuccess={refetchListing}
                  />
                )}
              </>
            )}
          </div>

          {/* Details */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="font-semibold mb-4">Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Contract Address</span>
                <span className="font-mono">
                  {nftContract.slice(0, 6)}...{nftContract.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Token ID</span>
                <span>{tokenId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Token Standard</span>
                <span>ERC-721</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Chain</span>
                <span>Ethereum</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
