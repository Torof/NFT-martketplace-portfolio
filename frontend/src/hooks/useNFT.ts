"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { type Address } from "viem";
import { fetchNFTMetadata, resolveImageURL } from "@/lib/metadata";
import type { NFTMetadata } from "@/types";

interface UseNFTResult {
  metadata: NFTMetadata | null;
  imageUrl: string;
  isLoading: boolean;
  error: Error | null;
}

export function useNFT(contractAddress: Address, tokenId: bigint): UseNFTResult {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const publicClient = usePublicClient();

  useEffect(() => {
    async function fetchMetadata() {
      if (!publicClient) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchNFTMetadata(publicClient, contractAddress, tokenId);
        setMetadata(data);
        if (data?.image) {
          setImageUrl(resolveImageURL(data.image));
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch metadata"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchMetadata();
  }, [publicClient, contractAddress, tokenId]);

  return { metadata, imageUrl, isLoading, error };
}
