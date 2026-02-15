# NFT Marketplace

A full-stack decentralized NFT marketplace built on Ethereum (Sepolia testnet). Users can browse collections, list NFTs for sale, and purchase them — all through a modern Web3 interface.

![Homepage Screenshot](frontend/public/Screenshot%20from%202026-02-15%2017-12-31.png)

## Features

- **List & Buy NFTs** — Fixed-price listings for ERC-721 and ERC-1155 tokens with configurable platform fees
- **Browse Any Collection** — Enter any NFT contract address to explore collections on Sepolia
- **NFT Detail Pages** — View metadata, traits, ownership info, and listing status for individual tokens
- **User Profiles** — See owned NFTs, active listings, and marketplace transaction history
- **On-Chain Event Indexing** — Activity feed and recent sales pulled directly from contract events
- **Wallet Integration** — Connect with MetaMask or any injected Web3 wallet via wagmi

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity 0.8.24, OpenZeppelin |
| Dev Framework | Hardhat |
| Frontend | Next.js 16, React 19 |
| Styling | Tailwind CSS 4 |
| Web3 | wagmi v3, viem |
| NFT Data | Alchemy NFT API |
| Testing | Hardhat + Chai |
| Deployment | Vercel (frontend), Sepolia testnet (contracts) |

## Project Structure

```
NFT-Marketplace/
├── contracts/
│   ├── NFTMarketplace.sol          # Core marketplace (ERC-721 + ERC-1155)
│   └── mocks/                      # Mock NFT contracts for testing
├── test/
│   └── NFTMarketplace.test.ts      # Contract test suite
├── scripts/
│   ├── deploy-sepolia.ts           # Sepolia deployment script
│   └── seed.ts                     # Test data seeding
├── frontend/
│   └── src/
│       ├── app/                    # Next.js App Router pages
│       │   ├── page.tsx            # Homepage
│       │   ├── explore/            # Browse all listings
│       │   ├── nft/[contract]/[tokenId]/  # NFT detail
│       │   ├── collection/[address]/      # Collection page
│       │   └── profile/[address]/         # User profile
│       ├── components/             # React components
│       ├── hooks/                  # Custom hooks (useMarketplace, useListings, etc.)
│       ├── lib/                    # Alchemy client, metadata utils, event client
│       └── config/                 # wagmi config, contract addresses & ABIs
├── hardhat.config.ts
└── package.json
```

## Smart Contract

The `NFTMarketplace` contract is deployed on Sepolia at [`0xA82e6cC47B416bF663aFAD81D88f2351Ef16dAa4`](https://sepolia.etherscan.io/address/0xA82e6cC47B416bF663aFAD81D88f2351Ef16dAa4).

Key design decisions:
- **Dual token support** — Separate listing/buying flows for ERC-721 and ERC-1155
- **Platform fees** — Configurable in basis points (2.5% default, 10% max)
- **Security** — ReentrancyGuard, custom errors, check-effects-interactions pattern, excess payment refunds
- **No custody** — NFTs stay in the seller's wallet until purchased (approval-based)

## Getting Started

### Prerequisites

- Node.js 18+
- A Web3 wallet (MetaMask) with Sepolia ETH

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/NFT-Marketplace.git
cd NFT-Marketplace

# Install contract dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

### Environment Variables

Create `.env` in the project root (for Hardhat):

```env
SEPOLIA_RPC_URL=your_sepolia_rpc_url
PRIVATE_KEY=your_wallet_private_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

Create `.env.local` in the `frontend/` directory:

```env
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0xA82e6cC47B416bF663aFAD81D88f2351Ef16dAa4
```

### Run Locally

```bash
# Compile contracts
npm run compile

# Run contract tests
npm test

# Start the frontend dev server
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Deploy Contracts

```bash
npm run deploy:sepolia
```

## Testing

The contract test suite covers:

- Listing, buying, and cancelling NFTs
- Price updates and relisting after cancellation
- Platform fee calculation, accumulation, and withdrawal
- Access control (owner-only functions, seller-only actions)
- Edge cases (zero price, insufficient payment, excess refunds, multiple collections)

```bash
npm test
```

## License

MIT
