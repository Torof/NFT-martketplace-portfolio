"use client";

import Link from "next/link";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { SearchBar } from "@/components/common/SearchBar";
import { useAccount } from "wagmi";

export function Header() {
  const { address } = useAccount();

  return (
    <header className="sticky top-0 z-50 bg-[var(--card)]/95 backdrop-blur-sm border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold shrink-0">
              NFT Market
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/explore"
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Explore
              </Link>
              {address && (
                <Link
                  href={`/profile/${address}`}
                  className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  My NFTs
                </Link>
              )}
            </nav>
          </div>

          <SearchBar className="hidden sm:block flex-1 max-w-md" />

          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
