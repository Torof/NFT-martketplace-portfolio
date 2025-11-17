"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { type Address, parseAbiItem } from "viem";
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from "@/config/contracts";

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

  useEffect(() => {
    async function fetchUserListings() {
      if (!publicClient || !userAddress) {
        setIsLoading(false);
        return;
      }

      try {
        // Get NFTListed events from this seller
        const listedEvents = await publicClient.getLogs({
          address: MARKETPLACE_ADDRESS,
          event: parseAbiItem(
            "event NFTListed(address indexed seller, address indexed nftContract, uint256 indexed tokenId, uint256 price)"
          ),
          args: {
            seller: userAddress,
          },
          fromBlock: 0n,
          toBlock: "latest",
        });

        // Check which listings are still active
        const activeListings: ListingItem[] = [];

        for (const event of listedEvents) {
          const listing = await publicClient.readContract({
            address: MARKETPLACE_ADDRESS,
            abi: MARKETPLACE_ABI,
            functionName: "getListing",
            args: [event.args.nftContract as Address, event.args.tokenId as bigint],
          });

          if (listing.active && listing.seller.toLowerCase() === userAddress.toLowerCase()) {
            activeListings.push({
              contract: event.args.nftContract as Address,
              tokenId: event.args.tokenId?.toString() || "0",
              name: `NFT #${event.args.tokenId?.toString()}`,
              image: "",
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
