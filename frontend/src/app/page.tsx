import Link from "next/link";
import { FeaturedNFTs } from "@/components/home/FeaturedNFTs";
import { TrendingCollections } from "@/components/home/TrendingCollections";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5" />
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            <span className="text-[var(--foreground)]">
              Discover & Trade{" "}
            </span>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              NFTs
            </span>
          </h1>
          <p className="mt-4 text-[var(--muted)] max-w-xl mx-auto">
            The premier NFT marketplace on Ethereum
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/explore"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:opacity-90 transition-opacity"
            >
              Explore
            </Link>
            <Link
              href="/explore"
              className="px-6 py-2.5 text-sm font-semibold border border-[var(--border)] rounded-lg hover:border-[var(--border-hover)] hover:bg-[var(--card)] transition-all"
            >
              List NFT
            </Link>
          </div>
        </div>
      </section>

      {/* Featured NFTs */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Featured NFTs</h2>
              <p className="text-[var(--muted)] mt-1">The most popular items on the marketplace</p>
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

      {/* Trending Collections */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[var(--card)]/50">
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
                className="group relative p-6 bg-[var(--card)] rounded-xl border border-[var(--border)] hover:border-[var(--border-hover)] transition-all duration-300 hover:-translate-y-1"
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
