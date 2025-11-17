"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { type Address, formatEther } from "viem";
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from "@/config/contracts";

interface BuyButtonProps {
  nftContract: Address;
  tokenId: bigint;
  price: bigint;
  onSuccess?: () => void;
}

export function BuyButton({ nftContract, tokenId, price, onSuccess }: BuyButtonProps) {
  const { isConnected } = useAccount();
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleBuy = async () => {
    setError(null);
    try {
      writeContract({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: "buyNFT",
        args: [nftContract, tokenId],
        value: price,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    }
  };

  if (isSuccess) {
    onSuccess?.();
    return (
      <div className="text-center py-4">
        <p className="text-green-500 font-medium">Purchase successful!</p>
        <p className="text-gray-400 text-sm mt-1">The NFT is now yours</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <button
        disabled
        className="w-full py-3 px-4 bg-gray-700 text-gray-400 rounded-lg cursor-not-allowed"
      >
        Connect wallet to buy
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={handleBuy}
        disabled={isPending || isConfirming}
        className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending
          ? "Confirm in wallet..."
          : isConfirming
          ? "Processing..."
          : `Buy for ${formatEther(price)} ETH`}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
