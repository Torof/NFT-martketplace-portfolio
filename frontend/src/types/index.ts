import { type Address } from "viem";

export interface Listing {
  seller: Address;
  nftContract: Address;
  tokenId: bigint;
  price: bigint;
  active: boolean;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: NFTAttribute[];
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

export interface NFTData {
  contract: Address;
  tokenId: bigint;
  owner: Address;
  metadata?: NFTMetadata;
  listing?: Listing;
}
