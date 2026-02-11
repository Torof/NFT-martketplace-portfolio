"use client";

import { useEffect, useState } from "react";
import { type Address } from "viem";
import { MARKETPLACE_ADDRESS } from "@/config/contracts";
import { getLogsChunked } from "@/lib/eventClient";

export type EventType = "listed" | "sold" | "bought" | "cancelled";

export interface HistoryEvent {
  id: string;
  type: EventType;
  nftContract: Address;
  tokenId: string;
  price: bigint;
  timestamp: number;
  transactionHash: string;
  blockNumber: bigint;
}

export function useMarketplaceHistory(userAddress: Address | undefined) {
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEvents([]);
    setIsLoading(true);
    setError(null);

    async function fetchHistory() {
      if (!userAddress) {
        setIsLoading(false);
        return;
      }

      try {
        const allEvents: HistoryEvent[] = [];

        // Fetch NFTListed events where user is the seller
        const listedLogs = await getLogsChunked({
          address: MARKETPLACE_ADDRESS,
          event: {
            type: "event",
            name: "NFTListed",
            inputs: [
              { indexed: true, name: "seller", type: "address" },
              { indexed: true, name: "nftContract", type: "address" },
              { indexed: true, name: "tokenId", type: "uint256" },
              { indexed: false, name: "price", type: "uint256" },
              { indexed: false, name: "amount", type: "uint256" },
              { indexed: false, name: "tokenType", type: "uint8" },
            ],
          },
          args: {
            seller: userAddress,
          },
        });

        for (const log of listedLogs) {
          allEvents.push({
            id: `listed-${log.transactionHash}-${log.logIndex}`,
            type: "listed",
            nftContract: log.args.nftContract as Address,
            tokenId: log.args.tokenId?.toString() || "0",
            price: log.args.price || 0n,
            timestamp: 0,
            transactionHash: log.transactionHash,
            blockNumber: log.blockNumber,
          });
        }

        // Fetch NFTSold events where user is the buyer
        const boughtLogs = await getLogsChunked({
          address: MARKETPLACE_ADDRESS,
          event: {
            type: "event",
            name: "NFTSold",
            inputs: [
              { indexed: true, name: "buyer", type: "address" },
              { indexed: true, name: "nftContract", type: "address" },
              { indexed: true, name: "tokenId", type: "uint256" },
              { indexed: false, name: "price", type: "uint256" },
              { indexed: false, name: "amount", type: "uint256" },
              { indexed: false, name: "tokenType", type: "uint8" },
            ],
          },
          args: {
            buyer: userAddress,
          },
        });

        for (const log of boughtLogs) {
          allEvents.push({
            id: `bought-${log.transactionHash}-${log.logIndex}`,
            type: "bought",
            nftContract: log.args.nftContract as Address,
            tokenId: log.args.tokenId?.toString() || "0",
            price: log.args.price || 0n,
            timestamp: 0,
            transactionHash: log.transactionHash,
            blockNumber: log.blockNumber,
          });
        }

        // Fetch ListingCancelled events where user is the seller
        const cancelledLogs = await getLogsChunked({
          address: MARKETPLACE_ADDRESS,
          event: {
            type: "event",
            name: "ListingCancelled",
            inputs: [
              { indexed: true, name: "seller", type: "address" },
              { indexed: true, name: "nftContract", type: "address" },
              { indexed: true, name: "tokenId", type: "uint256" },
            ],
          },
          args: {
            seller: userAddress,
          },
        });

        for (const log of cancelledLogs) {
          allEvents.push({
            id: `cancelled-${log.transactionHash}-${log.logIndex}`,
            type: "cancelled",
            nftContract: log.args.nftContract as Address,
            tokenId: log.args.tokenId?.toString() || "0",
            price: 0n,
            timestamp: 0,
            transactionHash: log.transactionHash,
            blockNumber: log.blockNumber,
          });
        }

        // Sort by block number (most recent first)
        allEvents.sort((a, b) => Number(b.blockNumber - a.blockNumber));

        setEvents(allEvents);
      } catch (err) {
        console.error("Error fetching marketplace history:", err);
        setError("Failed to load history");
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [userAddress]);

  return { events, isLoading, error };
}
