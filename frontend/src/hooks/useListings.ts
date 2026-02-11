"use client";

import { useEffect, useState } from "react";
import { type Address, parseAbiItem } from "viem";
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI, TokenType } from "@/config/contracts";
import { eventClient, getLogsChunked } from "@/lib/eventClient";
import { getNFTMetadata, getAlchemyImageUrl, getAlchemyNFTName } from "@/lib/alchemy";

interface ListingItem {
  contract: Address;
  tokenId: string;
  name: string;
  image: string;
  price: bigint;
  seller: Address;
  tokenType: "ERC721" | "ERC1155";
  amount: bigint;
}

export function useListings() {
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      try {
        // Get NFTListed events (chunked to handle any block range)
        const listedEvents = await getLogsChunked({
          address: MARKETPLACE_ADDRESS,
          event: parseAbiItem(
            "event NFTListed(address indexed seller, address indexed nftContract, uint256 indexed tokenId, uint256 price, uint256 amount, uint8 tokenType)"
          ),
        });

        console.log("Listed events found:", listedEvents.length);

        // Get NFTSold events to filter out sold items
        const soldEvents = await getLogsChunked({
          address: MARKETPLACE_ADDRESS,
          event: parseAbiItem(
            "event NFTSold(address indexed buyer, address indexed nftContract, uint256 indexed tokenId, uint256 price, uint256 amount, uint8 tokenType)"
          ),
        });

        // Get ListingCancelled events to filter out cancelled items
        const cancelledEvents = await getLogsChunked({
          address: MARKETPLACE_ADDRESS,
          event: parseAbiItem(
            "event ListingCancelled(address indexed seller, address indexed nftContract, uint256 indexed tokenId)"
          ),
        });

        // Create sets of sold and cancelled NFTs (include seller for ERC1155)
        const soldSet = new Set(
          soldEvents.map(
            (e) => `${e.args.nftContract}-${e.args.tokenId?.toString()}`
          )
        );
        const cancelledSet = new Set(
          cancelledEvents.map(
            (e) => `${e.args.seller}-${e.args.nftContract}-${e.args.tokenId?.toString()}`
          )
        );

        // Filter to only active listings (deduplicated)
        const activeListings: ListingItem[] = [];
        const processedSet = new Set<string>();

        for (const event of listedEvents) {
          const seller = event.args.seller as Address;
          const nftContract = event.args.nftContract as Address;
          const tokenId = event.args.tokenId as bigint;
          const tokenTypeNum = event.args.tokenType as number;
          const isERC1155 = tokenTypeNum === TokenType.ERC1155;

          // Key includes seller for ERC1155 (multiple sellers can list same token)
          const key = isERC1155
            ? `${seller}-${nftContract}-${tokenId.toString()}`
            : `${nftContract}-${tokenId.toString()}`;

          // Skip if already processed or cancelled
          if (processedSet.has(key)) continue;
          if (cancelledSet.has(`${seller}-${nftContract}-${tokenId.toString()}`)) continue;
          if (!isERC1155 && soldSet.has(`${nftContract}-${tokenId.toString()}`)) continue;

          processedSet.add(key);

          // Verify listing is still active on-chain
          let listing;
          try {
            if (isERC1155) {
              listing = await eventClient.readContract({
                address: MARKETPLACE_ADDRESS,
                abi: MARKETPLACE_ABI,
                functionName: "getERC1155Listing",
                args: [nftContract, tokenId, seller],
              });
            } else {
              listing = await eventClient.readContract({
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

          if (listing.active) {
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
              tokenType: isERC1155 ? "ERC1155" : "ERC721",
              amount: listing.amount,
            });
          }
        }

        console.log("Active listings:", activeListings.length);
        setListings(activeListings);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchListings();
  }, []);

  return { listings, isLoading };
}
