"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { type Address, parseEther } from "viem";
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI, ERC721_ABI } from "@/config/contracts";

export function useMarketplace() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const approveNFT = async (nftContract: Address, tokenId: bigint) => {
    writeContract({
      address: nftContract,
      abi: ERC721_ABI,
      functionName: "approve",
      args: [MARKETPLACE_ADDRESS, tokenId],
    });
  };

  const listNFT = async (
    nftContract: Address,
    tokenId: bigint,
    priceInEth: string
  ) => {
    const priceInWei = parseEther(priceInEth);
    writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "listNFT",
      args: [nftContract, tokenId, priceInWei],
    });
  };

  const buyNFT = async (nftContract: Address, tokenId: bigint, price: bigint) => {
    writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "buyNFT",
      args: [nftContract, tokenId],
      value: price,
    });
  };

  const cancelListing = async (nftContract: Address, tokenId: bigint) => {
    writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "cancelListing",
      args: [nftContract, tokenId],
    });
  };

  const updatePrice = async (
    nftContract: Address,
    tokenId: bigint,
    newPriceInEth: string
  ) => {
    const priceInWei = parseEther(newPriceInEth);
    writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "updateListingPrice",
      args: [nftContract, tokenId, priceInWei],
    });
  };

  return {
    approveNFT,
    listNFT,
    buyNFT,
    cancelListing,
    updatePrice,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
