"use client";

import { useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { type Address, formatEther } from "viem";
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from "@/config/contracts";
import { useToast } from "@/components/common/Toast";

interface BuyButtonProps {
  nftContract: Address;
  tokenId: bigint;
  price: bigint;
  onSuccess?: () => void;
}

export function BuyButton({ nftContract, tokenId, price, onSuccess }: BuyButtonProps) {
  const { isConnected } = useAccount();
  const { showToast } = useToast();

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isSuccess) {
      showToast("NFT purchased successfully!", "success");
      onSuccess?.();
    }
  }, [isSuccess, showToast, onSuccess]);

  useEffect(() => {
    if (error) {
      showToast(error.message || "Transaction failed", "error");
    }
  }, [error, showToast]);

  const handleBuy = () => {
    showToast("Confirm transaction in your wallet", "info");
    writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "buyNFT",
      args: [nftContract, tokenId],
      value: price,
    });
  };

  if (!isConnected) {
    return (
      <button
        disabled
        className="w-full py-3 px-4 bg-gray-700 text-gray-400 rounded-xl cursor-not-allowed"
      >
        Connect wallet to buy
      </button>
    );
  }

  return (
    <button
      onClick={handleBuy}
      disabled={isPending || isConfirming}
      className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-purple-600"
    >
      {isPending
        ? "Confirm in wallet..."
        : isConfirming
        ? "Processing..."
        : `Buy for ${formatEther(price)} ETH`}
    </button>
  );
}
