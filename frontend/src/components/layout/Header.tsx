"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ConnectButton } from "@/components/wallet/ConnectButton";
import { SearchBar } from "@/components/common/SearchBar";
import { useAccount } from "wagmi";

export function Header() {
  const { address } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[var(--card)] backdrop-blur-sm border-b border-[var(--border)] shadow-[var(--shadow-md)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              NFT Market
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/explore"
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Explore
              </Link>
              {mounted && address && (
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
