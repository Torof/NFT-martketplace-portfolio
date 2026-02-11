"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";
import { formatEther, type Address, parseAbiItem } from "viem";
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI, TokenType } from "@/config/contracts";
import { BuyButton } from "@/components/marketplace/BuyButton";
import { ListingActions } from "@/components/marketplace/ListingActions";
import { useAlchemyNFTDetail } from "@/hooks/useAlchemyNFTDetail";
import { eventClient, getLogsChunked } from "@/lib/eventClient";

interface PageProps {
  params: Promise<{
    contract: string;
    tokenId: string;
  }>;
}

interface ListingData {
  seller: Address;
  price: bigint;
  amount: bigint;
  active: boolean;
}

export default function NFTDetailPage({ params }: PageProps) {
  const { contract, tokenId } = use(params);
  const { address } = useAccount();

  const nftContract = contract as Address;
  const tokenIdBigInt = BigInt(tokenId);

  // Get NFT metadata and owner via Alchemy API
  const { nft, isLoading: nftLoading } = useAlchemyNFTDetail(nftContract, tokenId);

  // Get ERC721 listing info from marketplace contract
  const { data: erc721Listing, refetch: refetchERC721Listing } = useReadContract({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "getListing",
    args: [nftContract, tokenIdBigInt],
  });

  // State for ERC1155 listings (can have multiple sellers)
  const [erc1155Listings, setErc1155Listings] = useState<ListingData[]>([]);
  const [erc1155Loading, setErc1155Loading] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Fetch ERC1155 listings by querying events
  useEffect(() => {
    async function fetchERC1155Listings() {
      if (nft?.tokenType !== "ERC1155") return;

      setErc1155Loading(true);
      try {
        // Get all NFTListed events for this specific token (chunked to handle any block range)
        const listedEvents = await getLogsChunked({
          address: MARKETPLACE_ADDRESS,
          event: parseAbiItem(
            "event NFTListed(address indexed seller, address indexed nftContract, uint256 indexed tokenId, uint256 price, uint256 amount, uint8 tokenType)"
          ),
          args: {
            nftContract: nftContract,
            tokenId: tokenIdBigInt,
          },
        });

        // Get unique sellers
        const sellers = [...new Set(listedEvents.map(e => e.args.seller as Address))];

        // Check which listings are still active
        const activeListings: ListingData[] = [];
        for (const seller of sellers) {
          try {
            const listing = await eventClient.readContract({
              address: MARKETPLACE_ADDRESS,
              abi: MARKETPLACE_ABI,
              functionName: "getERC1155Listing",
              args: [nftContract, tokenIdBigInt, seller],
            });

            if (listing.active) {
              activeListings.push({
                seller: listing.seller,
                price: listing.price,
                amount: listing.amount,
                active: true,
              });
            }
          } catch (err) {
            console.error("Error fetching ERC1155 listing for seller:", seller, err);
          }
        }

        // Sort by price (lowest first)
        activeListings.sort((a, b) => (a.price < b.price ? -1 : 1));
        setErc1155Listings(activeListings);
      } catch (err) {
        console.error("Error fetching ERC1155 listings:", err);
      } finally {
        setErc1155Loading(false);
      }
    }

    fetchERC1155Listings();
  }, [nft?.tokenType, nftContract, tokenIdBigInt, refreshCounter]);

  const refetchListing = () => {
    refetchERC721Listing();
    // Trigger ERC1155 refetch
    setRefreshCounter(c => c + 1);
  };

  const owner = nft?.owner;
  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();

  // Determine listing status based on token type
  const isERC1155 = nft?.tokenType === "ERC1155";
  const listing = isERC1155 ? erc1155Listings[0] : erc721Listing;
  const isListed = isERC1155 ? erc1155Listings.length > 0 : erc721Listing?.active;
  const isSeller = address && listing?.seller && address.toLowerCase() === listing.seller.toLowerCase();

  const displayName = nft?.name || `NFT #${tokenId}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="aspect-square bg-[var(--card)] rounded-2xl overflow-hidden border border-[var(--border)] shadow-[var(--shadow-lg)]">
          {nftLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[var(--border)] border-t-blue-500" />
            </div>
          ) : nft?.image ? (
            <img
              src={nft.image}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[var(--muted)]">
              <div className="text-center">
                <div className="text-6xl mb-4">🖼️</div>
                <p>No image available</p>
              </div>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="flex flex-col">
          <div className="mb-2">
            <Link
              href={`/collection/${nftContract}`}
              className="text-blue-500 text-sm font-medium hover:text-blue-400 transition-colors"
            >
              {nft?.collectionName || "Collection"}
            </Link>
          </div>

          <h1 className="text-3xl font-bold mb-4">{displayName}</h1>

          {nft?.description && (
            <p className="text-[var(--muted)] mb-4">{nft.description}</p>
          )}

          <div className="flex items-center gap-2 text-[var(--muted)] mb-6">
            <span>Owned by</span>
            <span className="text-white font-medium">
              {nftLoading ? (
                "Loading..."
              ) : owner ? (
                isOwner ? (
                  "You"
                ) : (
                  <Link
                    href={`/profile/${owner}`}
                    className="hover:text-blue-400 transition-colors"
                  >
                    {owner.slice(0, 6)}...{owner.slice(-4)}
                  </Link>
                )
              ) : (
                "Unknown"
              )}
            </span>
          </div>

          {/* Price Card */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 mb-6 shadow-[var(--shadow-md)]">
            {erc1155Loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-[var(--border)] border-t-blue-500" />
                <span className="text-[var(--muted)]">Checking listings...</span>
              </div>
            ) : isListed && listing ? (
              <>
                <p className="text-[var(--muted)] text-sm mb-1">
                  {isERC1155 && erc1155Listings.length > 1
                    ? `Lowest Price (${erc1155Listings.length} listings)`
                    : "Current Price"}
                </p>
                <p className="text-3xl font-bold mb-2">
                  {formatEther(listing.price)} ETH
                </p>
                {isERC1155 && listing.amount > 1n && (
                  <p className="text-sm text-[var(--muted)] mb-4">
                    {listing.amount.toString()} available
                  </p>
                )}
                {!isERC1155 && <div className="mb-4" />}

                {!isOwner && !isSeller && (
                  <BuyButton
                    nftContract={nftContract}
                    tokenId={tokenIdBigInt}
                    price={listing.price}
                    tokenType={isERC1155 ? "ERC1155" : "ERC721"}
                    seller={listing.seller}
                    amount={listing.amount}
                    onSuccess={refetchListing}
                  />
                )}

                {isSeller && (
                  <ListingActions
                    nftContract={nftContract}
                    tokenId={tokenIdBigInt}
                    tokenType={isERC1155 ? "ERC1155" : "ERC721"}
                    currentPrice={listing.price}
                    onSuccess={refetchListing}
                  />
                )}

                {isERC1155 && !isSeller && listing.seller && (
                  <p className="text-xs text-[var(--muted)] mt-3">
                    Seller: {listing.seller.slice(0, 6)}...{listing.seller.slice(-4)}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-[var(--muted)] mb-4">Not listed for sale</p>
                {isOwner && (
                  <ListingActions
                    nftContract={nftContract}
                    tokenId={tokenIdBigInt}
                    tokenType={isERC1155 ? "ERC1155" : "ERC721"}
                    onSuccess={refetchListing}
                  />
                )}
              </>
            )}
          </div>

          {/* Traits */}
          {nft?.attributes && nft.attributes.length > 0 && (
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 mb-6 shadow-[var(--shadow-md)]">
              <h3 className="font-semibold mb-4">Traits</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {nft.attributes.map((attr, index) => (
                  <div
                    key={index}
                    className="bg-[var(--surface)] rounded-lg p-3 text-center"
                  >
                    <p className="text-xs text-blue-400 uppercase">
                      {attr.trait_type}
                    </p>
                    <p className="font-medium mt-1">{attr.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Details */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 shadow-[var(--shadow-md)]">
            <h3 className="font-semibold mb-4">Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Contract Address</span>
                <span className="font-mono">
                  {nftContract.slice(0, 6)}...{nftContract.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Token ID</span>
                <span>{tokenId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Token Standard</span>
                <span>{nft?.tokenType || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Chain</span>
                <span>Sepolia</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
