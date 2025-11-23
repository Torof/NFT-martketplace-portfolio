"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { type Address, parseAbiItem } from "viem";
import { MARKETPLACE_ADDRESS } from "@/config/contracts";
import { getNFTMetadata, getAlchemyImageUrl, getAlchemyNFTName } from "@/lib/alchemy";
import { eventClient, getSafeFromBlock } from "@/lib/eventClient";

interface SoldNFT {
  contract: Address;
  tokenId: string;
  name: string;
  image: string;
  price: bigint;
  buyer: Address;
}

export function useRecentSales() {
  const [sales, setSales] = useState<SoldNFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();

  useEffect(() => {
    async function fetchRecentSales() {
      if (!publicClient) {
        setIsLoading(false);
        return;
      }

      try {
        // Get a safe fromBlock within RPC limits
        const fromBlock = await getSafeFromBlock();

        // Get NFTSold events
        const soldEvents = await eventClient.getLogs({
          address: MARKETPLACE_ADDRESS,
          event: parseAbiItem(
            "event NFTSold(address indexed buyer, address indexed nftContract, uint256 indexed tokenId, uint256 price, uint256 amount, uint8 tokenType)"
          ),
          fromBlock,
          toBlock: "latest",
        });

        // Get the most recent 10 sales
        const recentSales = soldEvents.slice(-10).reverse();

        const soldNFTs: SoldNFT[] = [];

        for (const sale of recentSales) {
          const contract = sale.args.nftContract as Address;
          const tokenId = sale.args.tokenId!.toString();
          const price = sale.args.price as bigint;
          const buyer = sale.args.buyer as Address;

          // Use Alchemy API for reliable metadata and cached images
          const nft = await getNFTMetadata(contract, tokenId);

          soldNFTs.push({
            contract,
            tokenId,
            name: nft ? getAlchemyNFTName(nft) : `NFT #${tokenId}`,
            image: nft ? getAlchemyImageUrl(nft) : "",
            price,
            buyer,
          });
        }

        setSales(soldNFTs);
      } catch (error) {
        console.error("Error fetching recent sales:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentSales();
  }, [publicClient]);

  return { sales, isLoading };
}
