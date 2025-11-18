import { type Address } from "viem";
import { ERC721_ABI } from "@/config/contracts";
import type { NFTMetadata } from "@/types";

export async function fetchNFTMetadata(
  publicClient: any,
  contractAddress: Address,
  tokenId: bigint
): Promise<NFTMetadata | null> {
  try {
    const tokenURI = await publicClient.readContract({
      address: contractAddress,
      abi: ERC721_ABI,
      functionName: "tokenURI",
      args: [tokenId],
    });

    if (!tokenURI) return null;

    // Handle data URIs (base64 encoded JSON)
    if (tokenURI.startsWith("data:application/json;base64,")) {
      const base64Data = tokenURI.replace("data:application/json;base64,", "");
      const jsonString = atob(base64Data);
      return JSON.parse(jsonString);
    }

    // Handle data URIs (plain JSON)
    if (tokenURI.startsWith("data:application/json,")) {
      const jsonString = tokenURI.replace("data:application/json,", "");
      return JSON.parse(decodeURIComponent(jsonString));
    }

    // Handle IPFS URIs
    let url = tokenURI;
    if (tokenURI.startsWith("ipfs://")) {
      url = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/");
    }

    // Fetch from URL
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return null;
  }
}

export function resolveImageURL(image: string): string {
  if (!image) return "";

  // Handle data URIs
  if (image.startsWith("data:")) {
    return image;
  }

  // Handle IPFS
  if (image.startsWith("ipfs://")) {
    return image.replace("ipfs://", "https://ipfs.io/ipfs/");
  }

  return image;
}
