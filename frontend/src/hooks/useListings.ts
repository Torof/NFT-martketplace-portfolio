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

export function useListings() {
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();

  useEffect(() => {
    async function fetchListings() {
      if (!publicClient) {
        setIsLoading(false);
        return;
      }

      try {
        // Get NFTListed events
        const listedEvents = await publicClient.getLogs({
          address: MARKETPLACE_ADDRESS,
          event: parseAbiItem(
            "event NFTListed(address indexed seller, address indexed nftContract, uint256 indexed tokenId, uint256 price)"
          ),
          fromBlock: 0n,
          toBlock: "latest",
        });

        // Get NFTSold events to filter out sold items
        const soldEvents = await publicClient.getLogs({
          address: MARKETPLACE_ADDRESS,
          event: parseAbiItem(
            "event NFTSold(address indexed buyer, address indexed nftContract, uint256 indexed tokenId, uint256 price)"
          ),
          fromBlock: 0n,
          toBlock: "latest",
        });

        // Get ListingCancelled events to filter out cancelled items
        const cancelledEvents = await publicClient.getLogs({
          address: MARKETPLACE_ADDRESS,
          event: parseAbiItem(
            "event ListingCancelled(address indexed seller, address indexed nftContract, uint256 indexed tokenId)"
          ),
          fromBlock: 0n,
          toBlock: "latest",
        });

        // Create sets of sold and cancelled NFTs
        const soldSet = new Set(
          soldEvents.map(
            (e) => `${e.args.nftContract}-${e.args.tokenId?.toString()}`
          )
        );
        const cancelledSet = new Set(
          cancelledEvents.map(
            (e) => `${e.args.nftContract}-${e.args.tokenId?.toString()}`
          )
        );

        // Filter to only active listings and get latest price
        const activeListings = new Map<string, ListingItem>();

        for (const event of listedEvents) {
          const key = `${event.args.nftContract}-${event.args.tokenId?.toString()}`;

          // Skip if sold or cancelled
          if (soldSet.has(key) || cancelledSet.has(key)) continue;

          // Verify listing is still active on-chain
          const listing = await publicClient.readContract({
            address: MARKETPLACE_ADDRESS,
            abi: MARKETPLACE_ABI,
            functionName: "getListing",
            args: [event.args.nftContract as Address, event.args.tokenId as bigint],
          });

          if (listing.active) {
            activeListings.set(key, {
              contract: event.args.nftContract as Address,
              tokenId: event.args.tokenId?.toString() || "0",
              name: `NFT #${event.args.tokenId?.toString()}`,
              image: "", // Will be fetched from metadata
              price: listing.price,
              seller: listing.seller,
            });
          }
        }

        setListings(Array.from(activeListings.values()));
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchListings();
  }, [publicClient]);

  return { listings, isLoading };
}
