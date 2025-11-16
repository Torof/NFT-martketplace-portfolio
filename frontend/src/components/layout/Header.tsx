"use client";

import Link from "next/link";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { useAccount } from "wagmi";

export function Header() {
  const { address } = useAccount();

  return (
    <header className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-white">
              NFT Market
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/explore"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Explore
              </Link>
              {address && (
                <Link
                  href={`/profile/${address}`}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  My NFTs
                </Link>
              )}
            </nav>
          </div>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
