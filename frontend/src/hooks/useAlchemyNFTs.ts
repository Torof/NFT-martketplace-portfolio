"use client";

import { useEffect, useState } from "react";
import { type Address } from "viem";
import {
  getNFTsForOwner,
  getAlchemyImageUrl,
  getAlchemyNFTName,
  type AlchemyNFT,
} from "@/lib/alchemy";

export interface OwnedNFT {
  contract: Address;
  tokenId: string;
  name: string;
  image: string;
  collectionName: string;
}

export function useAlchemyOwnedNFTs(ownerAddress: Address | undefined) {
  const [nfts, setNfts] = useState<OwnedNFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when address changes
    setNfts([]);
    setIsLoading(true);
    setError(null);

    async function fetchNFTs() {
      if (!ownerAddress) {
        setIsLoading(false);
        return;
      }

      try {
        const alchemyNFTs = await getNFTsForOwner(ownerAddress);

        const formattedNFTs: OwnedNFT[] = alchemyNFTs.map((nft: AlchemyNFT) => ({
          contract: nft.contract.address as Address,
          tokenId: nft.tokenId,
          name: getAlchemyNFTName(nft),
          image: getAlchemyImageUrl(nft),
          collectionName: nft.contract.name || "Unknown Collection",
        }));

        setNfts(formattedNFTs);
      } catch (err) {
        console.error("Error fetching owned NFTs:", err);
        setError("Failed to load NFTs");
      } finally {
        setIsLoading(false);
      }
    }

    fetchNFTs();
  }, [ownerAddress]);

  return { nfts, isLoading, error };
}
