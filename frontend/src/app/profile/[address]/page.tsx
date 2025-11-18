"use client";

import { use, useState } from "react";
import { useAccount } from "wagmi";
import { type Address } from "viem";
import { NFTGrid } from "@/components/nft/NFTGrid";
import { useUserListings } from "@/hooks/useUserListings";
import { useOwnedNFTs } from "@/hooks/useOwnedNFTs";
import { KNOWN_NFT_CONTRACTS } from "@/config/contracts";

interface PageProps {
  params: Promise<{
    address: string;
  }>;
}

type Tab = "owned" | "listed";

export default function ProfilePage({ params }: PageProps) {
  const { address: profileAddress } = use(params);
  const { address: connectedAddress } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>("owned");

  const isOwnProfile =
    connectedAddress?.toLowerCase() === profileAddress.toLowerCase();

  const { listings, isLoading: listingsLoading } = useUserListings(
    profileAddress as Address
  );
  const { nfts: ownedNFTs, isLoading: ownedLoading } = useOwnedNFTs(
    profileAddress as Address,
    KNOWN_NFT_CONTRACTS
  );

  const isLoading = activeTab === "owned" ? ownedLoading : listingsLoading;

  // Convert owned NFTs to the format expected by NFTGrid
  const ownedItems = ownedNFTs.map((nft) => ({
    ...nft,
    price: undefined,
    seller: undefined,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full" />
          <div>
            <h1 className="text-2xl font-bold">
              {isOwnProfile ? "Your Profile" : "Profile"}
            </h1>
            <p className="text-gray-400 font-mono">
              {profileAddress.slice(0, 6)}...{profileAddress.slice(-4)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 mb-6">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab("owned")}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "owned"
                ? "border-blue-500 text-white"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Owned ({ownedNFTs.length})
          </button>
          <button
            onClick={() => setActiveTab("listed")}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "listed"
                ? "border-blue-500 text-white"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            Listed ({listings.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-600 border-t-blue-500" />
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      ) : activeTab === "owned" ? (
        <NFTGrid
          items={ownedItems}
          emptyMessage={
            isOwnProfile
              ? "You don't own any NFTs yet"
              : "No NFTs owned"
          }
        />
      ) : (
        <NFTGrid
          items={listings}
          emptyMessage={
            isOwnProfile
              ? "You haven't listed any NFTs yet"
              : "No NFTs listed"
          }
        />
      )}
    </div>
  );
}
