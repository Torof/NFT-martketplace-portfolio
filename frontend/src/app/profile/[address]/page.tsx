"use client";

import { use, useState, useMemo, useEffect } from "react";
import { useAccount } from "wagmi";
import { type Address } from "viem";
import { NFTGrid } from "@/components/nft/NFTGrid";
import { useUserListings } from "@/hooks/useUserListings";
import { useAlchemyOwnedNFTs } from "@/hooks/useAlchemyNFTs";
import { MarketplaceHistory } from "@/components/profile/MarketplaceHistory";

interface PageProps {
  params: Promise<{
    address: string;
  }>;
}

type Tab = "owned" | "listed" | "history";

export default function ProfilePage({ params }: PageProps) {
  const { address: profileAddress } = use(params);
  const { address: connectedAddress } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>("owned");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only check isOwnProfile after mounting to avoid hydration mismatch
  const isOwnProfile = mounted &&
    connectedAddress?.toLowerCase() === profileAddress.toLowerCase();

  const { listings, isLoading: listingsLoading } = useUserListings(
    profileAddress as Address
  );
  const { nfts: ownedNFTs, isLoading: ownedLoading } = useAlchemyOwnedNFTs(
    profileAddress as Address
  );

  const isLoading = activeTab === "owned" ? ownedLoading : activeTab === "listed" ? listingsLoading : false;

  // Convert owned NFTs to the format expected by NFTGrid
  // Mark which ones are already listed
  const ownedItems = useMemo(() => {
    return ownedNFTs.map((nft) => {
      const key = `${nft.contract.toLowerCase()}-${nft.tokenId}`;
      const listing = listings.find(
        (l) => l.contract.toLowerCase() === nft.contract.toLowerCase() && l.tokenId === nft.tokenId
      );
      return {
        ...nft,
        price: listing?.price,
        seller: listing?.seller,
      };
    });
  }, [ownedNFTs, listings]);

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
            <p className="text-[var(--muted)] font-mono">
              {profileAddress.slice(0, 6)}...{profileAddress.slice(-4)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border)] mb-6">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab("owned")}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "owned"
                ? "border-blue-500 text-white"
                : "border-transparent text-[var(--muted)] hover:text-white"
            }`}
          >
            Owned ({ownedNFTs.length})
          </button>
          <button
            onClick={() => setActiveTab("listed")}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "listed"
                ? "border-blue-500 text-white"
                : "border-transparent text-[var(--muted)] hover:text-white"
            }`}
          >
            Listed ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "history"
                ? "border-blue-500 text-white"
                : "border-transparent text-[var(--muted)] hover:text-white"
            }`}
          >
            History
          </button>
        </nav>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[var(--border)] border-t-blue-500" />
          <p className="text-[var(--muted)] mt-4">Loading...</p>
        </div>
      ) : activeTab === "owned" ? (
        <>
          {isOwnProfile && ownedItems.length > 0 && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-sm text-blue-400">
                <span className="font-medium">Tip:</span> Click on any NFT to view details and list it for sale on the marketplace.
              </p>
            </div>
          )}
          <NFTGrid
            items={ownedItems}
            emptyMessage={
              isOwnProfile
                ? "You don't own any NFTs yet"
                : "No NFTs owned"
            }
          />
        </>
      ) : activeTab === "listed" ? (
        <NFTGrid
          items={listings}
          emptyMessage={
            isOwnProfile
              ? "You haven't listed any NFTs yet"
              : "No NFTs listed"
          }
        />
      ) : (
        <MarketplaceHistory address={profileAddress as Address} />
      )}
    </div>
  );
}
