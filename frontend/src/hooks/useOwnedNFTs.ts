"use client";

import { useEffect, useState, useCallback } from "react";
import { usePublicClient, useBlockNumber } from "wagmi";
import { type Address, parseAbiItem } from "viem";
import { fetchNFTMetadata, resolveImageURL } from "@/lib/metadata";

interface OwnedNFT {
  contract: Address;
  tokenId: string;
  name: string;
  image: string;
}

// For local testing - tracks NFTs via Transfer events
// In production, use an indexer API like Alchemy
export function useOwnedNFTs(ownerAddress: Address, nftContracts: Address[]) {
  const [nfts, setNfts] = useState<OwnedNFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const publicClient = usePublicClient();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  // Reset state when address changes
  useEffect(() => {
    setNfts([]);
    setIsLoading(true);
  }, [ownerAddress]);

  const fetchOwnedNFTs = useCallback(async () => {
    if (!publicClient || !ownerAddress || nftContracts.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const ownedNFTs: OwnedNFT[] = [];

      for (const contractAddress of nftContracts) {
        // Get all Transfer events TO this address
        const transfersIn = await publicClient.getLogs({
          address: contractAddress,
          event: parseAbiItem(
            "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
          ),
          args: {
            to: ownerAddress,
          },
          fromBlock: 0n,
          toBlock: "latest",
        });

        // Get all Transfer events FROM this address
        const transfersOut = await publicClient.getLogs({
          address: contractAddress,
          event: parseAbiItem(
            "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
          ),
          args: {
            from: ownerAddress,
          },
          fromBlock: 0n,
          toBlock: "latest",
        });

        // Track ownership: tokens received minus tokens sent
        const tokenIds = new Set<string>();

        for (const transfer of transfersIn) {
          tokenIds.add(transfer.args.tokenId!.toString());
        }

        for (const transfer of transfersOut) {
          tokenIds.delete(transfer.args.tokenId!.toString());
        }

        // Fetch metadata for owned tokens
        for (const tokenId of tokenIds) {
          const metadata = await fetchNFTMetadata(
            publicClient,
            contractAddress,
            BigInt(tokenId)
          );

          ownedNFTs.push({
            contract: contractAddress,
            tokenId,
            name: metadata?.name || `NFT #${tokenId}`,
            image: metadata?.image ? resolveImageURL(metadata.image) : "",
          });
        }
      }

      setNfts(ownedNFTs);
    } catch (error) {
      console.error("Error fetching owned NFTs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, ownerAddress, nftContracts]);

  useEffect(() => {
    fetchOwnedNFTs();
  }, [fetchOwnedNFTs, blockNumber]);

  return { nfts, isLoading };
}
