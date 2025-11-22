"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { isAddress, type Address } from "viem";
import { getContractMetadata, getNFTMetadata, getAlchemyImageUrl } from "@/lib/alchemy";

// 10 Sepolia NFT collections - verified to have images
const FEATURED_COLLECTIONS = [
  {
    name: "BAYC Genesis",
    address: "0xe29f8038d1a3445ab22ad1373c65ec0a6e1161a4",
    description: "Bored Ape testnet deployment",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    name: "Uniswap V4 Positions",
    address: "0x429ba70129df741b2ca2a85bc3a2a3328e5c09b4",
    description: "10K+ generative LP position NFTs",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    name: "Pudgy Penguins",
    address: "0xa807e2a221c6daafe1b4a3ed2da5e8a53fdaf6be",
    description: "Cute penguin collectibles",
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    name: "Tux Staking",
    address: "0xd51b17da5e1eb201ba1fe549c67dfe7d0f276e5c",
    description: "Stakeable penguin NFTs",
    gradient: "from-slate-600 to-zinc-700",
  },
  {
    name: "Foundry Course NFT",
    address: "0x76b50696b8effca6ee6da7f6471110f334536321",
    description: "Cyfrin dev course rewards",
    gradient: "from-orange-500 to-red-500",
  },
  {
    name: "SuperPower NFT",
    address: "0x20BEa03DdD82C7EE63f0B2AcAee655f8248d7b09",
    description: "Unique superpower traits",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    name: "Eto Vass Art",
    address: "0x331dbe16931a959055b73ce6cd2a1006ce79972b",
    description: "On-chain SVG art tutorial",
    gradient: "from-purple-500 to-violet-600",
  },
  {
    name: "Nifty NFT",
    address: "0x61e4f6367ded241bff165326f076c2b240addfb6",
    description: "Creative digital collectibles",
    gradient: "from-yellow-400 to-amber-500",
  },
  {
    name: "Fine Art",
    address: "0x51e3591b0d3188e485835b4b70c0282f8aa69e2f",
    description: "Digital fine art collection",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    name: "Robo NFT",
    address: "0xee6eb9c7051e617585a5ff75637a7f5f66090d08",
    description: "Nifty Island robot collectibles",
    gradient: "from-fuchsia-500 to-pink-500",
  },
];

function CollectionImage({
  contractAddress,
  name,
  gradient
}: {
  contractAddress: string;
  name: string;
  gradient: string;
}) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchImage() {
      try {
        // First try to get collection image from contract metadata
        const contractMeta = await getContractMetadata(contractAddress as Address);
        if (!cancelled && contractMeta?.openSeaMetadata?.imageUrl) {
          setImageUrl(contractMeta.openSeaMetadata.imageUrl);
          setIsLoading(false);
          return;
        }

        // Fall back to NFT #1 (or #0) image
        let nft = await getNFTMetadata(contractAddress as Address, "1");
        if (!nft) {
          nft = await getNFTMetadata(contractAddress as Address, "0");
        }

        if (!cancelled && nft) {
          const url = getAlchemyImageUrl(nft);
          if (url) {
            setImageUrl(url);
          }
        }
      } catch (err) {
        console.error("Error fetching collection image:", err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchImage();
    return () => { cancelled = true; };
  }, [contractAddress]);

  if (isLoading) {
    return (
      <div className={`w-20 h-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-2xl shrink-0 animate-pulse`}>
        {name.charAt(0)}
      </div>
    );
  }

  if (!imageUrl || hasError) {
    return (
      <div className={`w-20 h-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-2xl shrink-0`}>
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <div className="w-20 h-full shrink-0 relative bg-[var(--surface)]">
      <Image
        src={imageUrl}
        alt={name}
        fill
        className="object-cover"
        onError={() => setHasError(true)}
        unoptimized
      />
    </div>
  );
}

export function CollectionSearch() {
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!address.trim()) {
      setError("Please enter a contract address");
      return;
    }

    if (!isAddress(address)) {
      setError("Invalid Ethereum address");
      return;
    }

    router.push(`/collection/${address}`);
  };

  const handleQuickAccess = (collectionAddress: string) => {
    router.push(`/collection/${collectionAddress}`);
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setError("");
            }}
            placeholder="Enter NFT contract address (0x...)"
            className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
          />
          {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shrink-0"
        >
          Browse
        </button>
      </form>

      {/* Quick Access Collections - Auto-scrolling Carousel - Full width */}
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
        <p className="text-sm text-[var(--muted)] mb-3 max-w-3xl mx-auto px-4">Quick access to popular collections:</p>
        <div className="relative overflow-hidden">
          {/* Gradient overlays for smooth edges */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[var(--background)] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[var(--background)] to-transparent z-10 pointer-events-none" />

          {/* Scrolling container */}
          <div className="flex gap-4 animate-scroll hover:pause-animation">
            {/* Duplicate collections for seamless loop */}
            {[...FEATURED_COLLECTIONS, ...FEATURED_COLLECTIONS].map((collection, index) => (
              <button
                key={`${collection.address}-${index}`}
                onClick={() => handleQuickAccess(collection.address)}
                className="flex items-stretch bg-[var(--card)] border border-[var(--border)] rounded-2xl hover:border-blue-500/50 hover:bg-[var(--card-hover)] transition-all text-left shrink-0 w-[320px] h-[80px] overflow-hidden"
              >
                <div className="w-20 h-full shrink-0 overflow-hidden rounded-l-2xl">
                  <CollectionImage
                    contractAddress={collection.address}
                    name={collection.name}
                    gradient={collection.gradient}
                  />
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-center px-4">
                  <p className="font-semibold text-base truncate">{collection.name}</p>
                  <p className="text-sm text-[var(--muted)] truncate mt-0.5">{collection.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Help Text */}
      <p className="text-xs text-[var(--muted)] text-center">
        Find NFT contract addresses on{" "}
        <a
          href="https://sepolia.etherscan.io/tokens-nft"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          Sepolia Etherscan
        </a>
      </p>
    </div>
  );
}
