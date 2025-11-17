import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Discover, Collect, and Sell
              <span className="block text-blue-500">Extraordinary NFTs</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
              The leading NFT marketplace on Ethereum. Buy, sell, and discover
              rare digital assets.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/explore"
                className="px-8 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explore
              </Link>
              <Link
                href="/explore"
                className="px-8 py-3 text-lg font-medium text-white border border-gray-600 rounded-lg hover:border-gray-500 hover:bg-gray-800 transition-colors"
              >
                List NFT
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white">10K+</div>
              <div className="mt-2 text-gray-400">NFTs Listed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white">5K+</div>
              <div className="mt-2 text-gray-400">Artists</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white">1M+</div>
              <div className="mt-2 text-gray-400">Total Sales</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white">100K+</div>
              <div className="mt-2 text-gray-400">Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect Wallet</h3>
              <p className="text-gray-400">
                Connect your MetaMask or any Web3 wallet to get started
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Browse NFTs</h3>
              <p className="text-gray-400">
                Explore collections and find the perfect NFT for your portfolio
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Buy or Sell</h3>
              <p className="text-gray-400">
                Purchase NFTs instantly or list your own for sale
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
