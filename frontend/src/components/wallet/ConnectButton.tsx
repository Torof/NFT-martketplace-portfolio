"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

function PowerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  );
}

export function ConnectButton() {
  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string | undefined>();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync address state
  useEffect(() => {
    setCurrentAddress(address);
  }, [address]);

  // Listen for account changes directly from window.ethereum
  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accountList = accounts as string[];
      console.log("Accounts changed:", accountList);
      if (accountList.length === 0) {
        disconnect();
      } else {
        // Force page reload to get new account state
        window.location.reload();
      }
    };

    const handleChainChanged = () => {
      // Reload on chain change
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, [disconnect]);

  const handleConnect = () => {
    const injectedConnector = connectors.find((c) => c.id === "injected");
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  if (!mounted) {
    return (
      <button
        className="group relative p-2.5 rounded-full bg-[var(--surface)] border border-[var(--border)] transition-all duration-300 shadow-[var(--shadow-sm)]"
        disabled
      >
        <PowerIcon className="w-5 h-5 text-[var(--muted)]" />
      </button>
    );
  }

  if (isConnected && currentAddress) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--muted)] hidden sm:block">
          {currentAddress.slice(0, 6)}...{currentAddress.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="group relative p-2.5 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:border-red-500/50 transition-all duration-300 shadow-[var(--shadow-sm)]"
          title="Disconnect wallet"
        >
          <PowerIcon className="w-5 h-5 text-green-400 group-hover:text-red-400 transition-colors" />
          <span className="absolute inset-0 rounded-full bg-green-400/10 group-hover:bg-red-400/10 transition-colors" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isPending}
      className="group relative p-2.5 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:border-blue-500/50 transition-all duration-300 shadow-[var(--shadow-sm)] hover:shadow-[var(--glow-blue)] disabled:opacity-50 disabled:cursor-not-allowed"
      title="Connect wallet"
    >
      <PowerIcon
        className={`w-5 h-5 text-[var(--muted)] group-hover:text-blue-400 transition-colors ${
          isPending ? "animate-pulse" : ""
        }`}
      />
    </button>
  );
}
