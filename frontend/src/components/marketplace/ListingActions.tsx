"use client";

import { useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { type Address, parseEther, formatEther } from "viem";
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI, ERC721_ABI } from "@/config/contracts";

interface ListingActionsProps {
  nftContract: Address;
  tokenId: bigint;
  currentPrice?: bigint;
  onSuccess?: () => void;
}

export function ListingActions({
  nftContract,
  tokenId,
  currentPrice,
  onSuccess,
}: ListingActionsProps) {
  const { address } = useAccount();
  const [price, setPrice] = useState(
    currentPrice ? formatEther(currentPrice) : ""
  );
  const [mode, setMode] = useState<"view" | "list" | "update">("view");
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending, reset } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Check if marketplace is approved
  const { data: approvedAddress } = useReadContract({
    address: nftContract,
    abi: ERC721_ABI,
    functionName: "getApproved",
    args: [tokenId],
  });

  const { data: isApprovedForAll } = useReadContract({
    address: nftContract,
    abi: ERC721_ABI,
    functionName: "isApprovedForAll",
    args: [address as Address, MARKETPLACE_ADDRESS],
  });

  const isApproved =
    approvedAddress?.toLowerCase() === MARKETPLACE_ADDRESS.toLowerCase() ||
    isApprovedForAll;

  const isListed = currentPrice !== undefined;

  const handleApprove = () => {
    setError(null);
    writeContract({
      address: nftContract,
      abi: ERC721_ABI,
      functionName: "approve",
      args: [MARKETPLACE_ADDRESS, tokenId],
    });
  };

  const handleList = () => {
    if (!price || parseFloat(price) <= 0) {
      setError("Please enter a valid price");
      return;
    }
    setError(null);
    writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "listNFT",
      args: [nftContract, tokenId, parseEther(price)],
    });
  };

  const handleUpdatePrice = () => {
    if (!price || parseFloat(price) <= 0) {
      setError("Please enter a valid price");
      return;
    }
    setError(null);
    writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "updateListingPrice",
      args: [nftContract, tokenId, parseEther(price)],
    });
  };

  const handleCancel = () => {
    setError(null);
    writeContract({
      address: MARKETPLACE_ADDRESS,
      abi: MARKETPLACE_ABI,
      functionName: "cancelListing",
      args: [nftContract, tokenId],
    });
  };

  if (isSuccess) {
    onSuccess?.();
    return (
      <div className="text-center py-4">
        <p className="text-green-500 font-medium">Transaction successful!</p>
        <button
          onClick={() => {
            reset();
            setMode("view");
          }}
          className="text-blue-500 text-sm mt-2 hover:underline"
        >
          Done
        </button>
      </div>
    );
  }

  // Not listed - show list button
  if (!isListed) {
    if (mode === "list") {
      return (
        <div className="space-y-4">
          {!isApproved ? (
            <>
              <p className="text-gray-400 text-sm">
                First, approve the marketplace to transfer your NFT
              </p>
              <button
                onClick={handleApprove}
                disabled={isPending || isConfirming}
                className="w-full py-3 px-4 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                {isPending || isConfirming ? "Processing..." : "Approve Marketplace"}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Price (ETH)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setMode("view")}
                  className="flex-1 py-3 px-4 border border-gray-600 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleList}
                  disabled={isPending || isConfirming || !price}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isPending || isConfirming ? "Processing..." : "List NFT"}
                </button>
              </div>
            </>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      );
    }

    return (
      <button
        onClick={() => setMode("list")}
        className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        List for Sale
      </button>
    );
  }

  // Listed - show update/cancel options
  if (mode === "update") {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            New Price (ETH)
          </label>
          <input
            type="number"
            step="0.001"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setMode("view")}
            className="flex-1 py-3 px-4 border border-gray-600 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdatePrice}
            disabled={isPending || isConfirming || !price}
            className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isPending || isConfirming ? "Processing..." : "Update Price"}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => setMode("update")}
        className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        Update Price
      </button>
      <button
        onClick={handleCancel}
        disabled={isPending || isConfirming}
        className="w-full py-3 px-4 border border-red-600 text-red-500 font-medium rounded-lg hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
      >
        {isPending || isConfirming ? "Processing..." : "Cancel Listing"}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
