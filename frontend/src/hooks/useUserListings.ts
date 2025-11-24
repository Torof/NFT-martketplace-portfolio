"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { type Address, parseAbiItem } from "viem";
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI, TokenType } from "@/config/contracts";
import { eventClient, getSafeFromBlock } from "@/lib/eventClient";
import { getNFTMetadata, getAlchemyImageUrl, getAlchemyNFTName } from "@/lib/alchemy";

interface ListingItem {
  contract: Address;
  tokenId: string;
  name: string;
  image: string;
  price: bigint;
  seller: Address;
}

export function useUserListings(userAddress: Address) {
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();

  // Reset state when address changes
  useEffect(() => {
    setListings([]);
    setIsLoading(true);
  }, [userAddress]);

  useEffect(() => {
    async function fetchUserListings() {
      if (!publicClient || !userAddress) {
        setIsLoading(false);
        return;
      }

      try {
        // Get a safe fromBlock within RPC limits
        const fromBlock = await getSafeFromBlock();

        // Get NFTListed events from this seller
        const listedEvents = await eventClient.getLogs({
          address: MARKETPLACE_ADDRESS,
          event: parseAbiItem(
            "event NFTListed(address indexed seller, address indexed nftContract, uint256 indexed tokenId, uint256 price, uint256 amount, uint8 tokenType)"
          ),
          args: {
            seller: userAddress,
          },
          fromBlock,
          toBlock: "latest",
        });

        // Check which listings are still active
        const activeListings: ListingItem[] = [];

        for (const event of listedEvents) {
          const nftContract = event.args.nftContract as Address;
          const tokenId = event.args.tokenId as bigint;
          const tokenTypeNum = event.args.tokenType as number;
          const isERC1155 = tokenTypeNum === TokenType.ERC1155;

          // Get listing based on token type
          let listing;
          try {
            if (isERC1155) {
              listing = await publicClient.readContract({
                address: MARKETPLACE_ADDRESS,
                abi: MARKETPLACE_ABI,
                functionName: "getERC1155Listing",
                args: [nftContract, tokenId, userAddress],
              });
            } else {
              listing = await publicClient.readContract({
                address: MARKETPLACE_ADDRESS,
                abi: MARKETPLACE_ABI,
                functionName: "getListing",
                args: [nftContract, tokenId],
              });
            }
          } catch (err) {
            console.error("Error fetching listing:", err);
            continue;
          }

          if (listing.active && listing.seller.toLowerCase() === userAddress.toLowerCase()) {
            // Fetch metadata using Alchemy
            let name = `NFT #${tokenId.toString()}`;
            let image = "";

            try {
              const metadata = await getNFTMetadata(nftContract, tokenId.toString());
              if (metadata) {
                name = getAlchemyNFTName(metadata);
                image = getAlchemyImageUrl(metadata);
              }
            } catch (err) {
              console.error("Error fetching metadata:", err);
            }

            activeListings.push({
              contract: nftContract,
              tokenId: tokenId.toString(),
              name,
              image,
              price: listing.price,
              seller: listing.seller,
            });
          }
        }

        setListings(activeListings);
      } catch (error) {
        console.error("Error fetching user listings:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserListings();
  }, [publicClient, userAddress]);

  return { listings, isLoading };
}
