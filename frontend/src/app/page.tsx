import Link from "next/link";
import { FeaturedNFTs } from "@/components/home/FeaturedNFTs";
import { RecentlySold } from "@/components/home/RecentlySold";
import { TrendingCollections } from "@/components/home/TrendingCollections";
import { CollectionSearch } from "@/components/home/CollectionSearch";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Soft gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/80 via-purple-500/70 to-pink-500/80" />

        {/* Soft color blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-purple-400/25 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 right-0 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl" />
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl" />
        </div>

        {/* Subtle floating shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-[10%] w-16 h-16 bg-white/10 rounded-full animate-blob" />
          <div className="absolute bottom-10 left-[30%] w-12 h-12 bg-white/15 rounded-lg rotate-45 animate-blob-reverse" />
          <div className="absolute top-20 right-[20%] w-20 h-20 bg-white/10 rounded-full animate-blob" />
          <div className="absolute bottom-16 right-[40%] w-10 h-10 bg-white/15 rounded-lg rotate-12 animate-blob-reverse" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left side - Title */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white drop-shadow-lg">
                Discover & Trade{" "}
                <span className="text-cyan-300">NFTs</span>
              </h1>
              <p className="mt-4 text-white/90 max-w-xl text-lg">
                The premier NFT marketplace on Ethereum
              </p>
              <div className="mt-6 flex items-center justify-center lg:justify-start gap-3">
                <Link
                  href="/explore"
                  className="px-6 py-2.5 text-sm font-semibold text-gray-900 bg-white rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Explore
                </Link>
                <Link
                  href="/explore"
                  className="px-6 py-2.5 text-sm font-semibold border-2 border-white text-white rounded-lg hover:bg-white hover:text-gray-900 transition-all"
                >
                  List NFT
                </Link>
              </div>
            </div>

            {/* Right side - Feature Card */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 shadow-[var(--shadow-lg)] backdrop-blur-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                Portfolio Project
              </h2>
              <p className="text-[var(--muted)] text-sm mb-4">
                Full-stack Web3 marketplace on Sepolia testnet:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm"><strong>Smart Contracts</strong> - Solidity marketplace supporting ERC721 & ERC1155</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm"><strong>Next.js 14 + wagmi v2</strong> - Modern React with viem for Web3</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm"><strong>NFT Trading</strong> - List, buy, cancel listings with platform fees</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm"><strong>Alchemy NFT API</strong> - Metadata fetching for any Sepolia collection</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm"><strong>Event Indexing</strong> - Real-time updates from on-chain events</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Browse Collections */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[var(--surface)]/40 border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">Browse Any Collection</h2>
            <p className="text-[var(--muted)] mt-1">
              Enter any NFT contract address to explore collections on Sepolia
            </p>
          </div>
          <CollectionSearch />
        </div>
      </section>

      {/* Featured NFTs */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Listed NFTs</h2>
              <p className="text-[var(--muted)] mt-1">NFTs currently for sale on the marketplace</p>
            </div>
            <Link
              href="/explore"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              View all →
            </Link>
          </div>
          <FeaturedNFTs />
        </div>
      </section>

      {/* Recently Sold */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[var(--card)]/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold">Recently Sold</h2>
              <p className="text-[var(--muted)] text-sm mt-1">Latest transactions on the marketplace</p>
            </div>
          </div>
          <RecentlySold />
        </div>
      </section>

      {/* Trending Collections */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--surface)]/40 border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Trending Collections</h2>
              <p className="text-[var(--muted)] mt-1">Top collections over the last 24 hours</p>
            </div>
          </div>
          <TrendingCollections />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-[var(--muted)] text-center mb-12 max-w-2xl mx-auto">
            Get started in just a few simple steps
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Connect Wallet",
                description: "Link your MetaMask or any Web3 wallet to start trading",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Browse & Discover",
                description: "Explore thousands of NFTs from artists and collectors",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Buy or Sell",
                description: "Purchase NFTs instantly or list your own creations",
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group relative p-6 bg-[var(--card)] rounded-xl border border-[var(--border)] hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-2 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)]"
              >
                <div className="absolute -top-3 -left-3 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-xs font-bold text-white">
                  {item.step}
                </div>
                <div className="mt-4 mb-3 text-blue-400">{item.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-[var(--muted)] text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-10 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Ready to start your NFT journey?
              </h2>
              <p className="text-white/80 mb-6 max-w-xl mx-auto text-sm">
                Join thousands of creators and collectors on the fastest-growing NFT marketplace.
              </p>
              <Link
                href="/explore"
                className="inline-block px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Start Exploring
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
