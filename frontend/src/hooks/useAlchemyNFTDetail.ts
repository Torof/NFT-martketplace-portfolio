"use client";

import { useEffect, useState } from "react";
import { type Address } from "viem";
import {
  getNFTMetadata,
  getAlchemyImageUrl,
  getAlchemyNFTName,
  type AlchemyNFT,
} from "@/lib/alchemy";
import { ALCHEMY_NFT_API_URL } from "@/config/alchemy";

export interface NFTDetail {
  name: string;
  description: string;
  image: string;
  owner: Address | null;
  collectionName: string;
  tokenType: "ERC721" | "ERC1155" | "UNKNOWN";
  attributes: Array<{ trait_type: string; value: string }>;
}

export function useAlchemyNFTDetail(contractAddress: Address, tokenId: string) {
  const [nft, setNft] = useState<NFTDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNFTDetail() {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch NFT metadata
        const metadata = await getNFTMetadata(contractAddress, tokenId);

        if (!metadata) {
          setError("NFT not found");
          setIsLoading(false);
          return;
        }

        // Fetch owner using Alchemy's getOwnersForNFT endpoint
        let owner: Address | null = null;
        try {
          const ownerResponse = await fetch(
            `${ALCHEMY_NFT_API_URL}/getOwnersForNFT?contractAddress=${contractAddress}&tokenId=${tokenId}`
          );
          if (ownerResponse.ok) {
            const ownerData = await ownerResponse.json();
            if (ownerData.owners && ownerData.owners.length > 0) {
              owner = ownerData.owners[0] as Address;
            }
          }
        } catch (err) {
          console.error("Error fetching owner:", err);
        }

        // Parse token type from Alchemy response
        const rawTokenType = metadata.contract?.tokenType?.toUpperCase() || "";
        let tokenType: "ERC721" | "ERC1155" | "UNKNOWN" = "UNKNOWN";
        if (rawTokenType.includes("ERC721") || rawTokenType === "ERC721") {
          tokenType = "ERC721";
        } else if (rawTokenType.includes("ERC1155") || rawTokenType === "ERC1155") {
          tokenType = "ERC1155";
        }

        setNft({
          name: getAlchemyNFTName(metadata),
          description: metadata.description || metadata.raw?.metadata?.description || "",
          image: getAlchemyImageUrl(metadata),
          owner,
          collectionName: metadata.contract?.name || "Collection",
          tokenType,
          attributes: metadata.raw?.metadata?.attributes || [],
        });
      } catch (err) {
        console.error("Error fetching NFT detail:", err);
        setError("Failed to load NFT");
      } finally {
        setIsLoading(false);
      }
    }

    fetchNFTDetail();
  }, [contractAddress, tokenId]);

  return { nft, isLoading, error };
}
