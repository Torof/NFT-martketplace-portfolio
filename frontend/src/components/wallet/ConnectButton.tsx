"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

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
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--muted)] hidden sm:block">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="group relative p-2.5 rounded-full bg-[var(--card)] border border-[var(--border)] hover:border-red-500/50 transition-all duration-300"
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
      onClick={() => connect({ connector: injected() })}
      disabled={isPending}
      className="group relative p-2.5 rounded-full bg-[var(--card)] border border-[var(--border)] hover:border-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
