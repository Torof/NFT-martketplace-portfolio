import { ALCHEMY_NFT_API_URL } from "@/config/alchemy";
import { type Address } from "viem";

export interface AlchemyNFT {
  contract: {
    address: string;
    name: string;
    symbol: string;
    tokenType: string;
  };
  tokenId: string;
  name: string;
  description: string;
  image: {
    cachedUrl: string;
    thumbnailUrl: string;
    originalUrl: string;
  };
  raw: {
    metadata: {
      name?: string;
      description?: string;
      image?: string;
      attributes?: Array<{ trait_type: string; value: string }>;
    };
  };
}

export interface AlchemyCollection {
  address: string;
  name: string;
  symbol: string;
  totalSupply: string;
  tokenType: string;
  openSeaMetadata?: {
    floorPrice?: number;
    collectionName?: string;
    collectionSlug?: string;
    imageUrl?: string;
    description?: string;
  };
}

// Fetch all NFTs owned by an address
export async function getNFTsForOwner(ownerAddress: Address): Promise<AlchemyNFT[]> {
  try {
    const response = await fetch(
      `${ALCHEMY_NFT_API_URL}/getNFTsForOwner?owner=${ownerAddress}&withMetadata=true&pageSize=100`
    );

    if (!response.ok) {
      throw new Error(`Alchemy API error: ${response.status}`);
    }

    const data = await response.json();
    return data.ownedNfts || [];
  } catch (error) {
    console.error("Error fetching NFTs for owner:", error);
    return [];
  }
}

// Fetch all NFTs in a collection
export async function getNFTsForCollection(
  contractAddress: Address,
  startToken?: string,
  limit: number = 100
): Promise<{ nfts: AlchemyNFT[]; nextToken?: string }> {
  try {
    let url = `${ALCHEMY_NFT_API_URL}/getNFTsForContract?contractAddress=${contractAddress}&withMetadata=true&limit=${limit}`;

    if (startToken) {
      url += `&startToken=${startToken}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Alchemy API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      nfts: data.nfts || [],
      nextToken: data.pageKey,
    };
  } catch (error) {
    console.error("Error fetching NFTs for collection:", error);
    return { nfts: [] };
  }
}

// Fetch single NFT metadata
export async function getNFTMetadata(
  contractAddress: Address,
  tokenId: string
): Promise<AlchemyNFT | null> {
  try {
    const response = await fetch(
      `${ALCHEMY_NFT_API_URL}/getNFTMetadata?contractAddress=${contractAddress}&tokenId=${tokenId}`
    );

    if (!response.ok) {
      throw new Error(`Alchemy API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching NFT metadata:", error);
    return null;
  }
}

// Fetch collection/contract metadata
export async function getContractMetadata(
  contractAddress: Address
): Promise<AlchemyCollection | null> {
  try {
    const response = await fetch(
      `${ALCHEMY_NFT_API_URL}/getContractMetadata?contractAddress=${contractAddress}`
    );

    if (!response.ok) {
      throw new Error(`Alchemy API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching contract metadata:", error);
    return null;
  }
}

// Helper to get image URL from Alchemy NFT
export function getAlchemyImageUrl(nft: AlchemyNFT): string {
  return (
    nft.image?.cachedUrl ||
    nft.image?.thumbnailUrl ||
    nft.image?.originalUrl ||
    nft.raw?.metadata?.image ||
    ""
  );
}

// Helper to get NFT name
export function getAlchemyNFTName(nft: AlchemyNFT): string {
  return (
    nft.name ||
    nft.raw?.metadata?.name ||
    `${nft.contract.name || "NFT"} #${nft.tokenId}`
  );
}
