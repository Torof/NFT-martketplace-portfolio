# NFT Marketplace - Project Specification

## Overview

A decentralized NFT marketplace built on Ethereum (Sepolia testnet) supporting ERC-721 token trading. Users can browse, list, and purchase NFTs from any collection with a seamless Web3 experience.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Blockchain | Ethereum (Sepolia Testnet) |
| Smart Contracts | Solidity ^0.8.20 |
| Development Framework | Hardhat |
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Wallet Connection | wagmi + viem |
| NFT Indexing | Alchemy NFT API |
| IPFS/Metadata | Pinata / Public gateways |
| Testing | Hardhat + Chai |

---

## Features

### Phase 1 - MVP (Essential)

#### Smart Contracts
- [ ] Marketplace contract with listing/buying functionality
- [ ] Fixed-price listings only
- [ ] Platform fee support (configurable percentage)
- [ ] Listing cancellation
- [ ] Events for all state changes (for indexing)

#### Frontend
- [ ] Homepage with featured/recent listings
- [ ] Browse all active listings with pagination
- [ ] Search NFTs by collection address or token ID
- [ ] Individual NFT detail page
  - Metadata display (image, name, description, traits)
  - Current price (if listed)
  - Owner information
  - Buy button / List button (based on ownership)
- [ ] User profile page
  - Owned NFTs
  - Active listings
  - Purchase/sale history
- [ ] Wallet connection (MetaMask, WalletConnect)
- [ ] List NFT modal (set price, approve, list)
- [ ] Buy flow with transaction feedback
- [ ] Transaction history/activity feed

### Phase 2 - Enhanced Features

- [ ] Make offers on unlisted NFTs
- [ ] Accept/reject/counter offers
- [ ] Auction support (English auctions with time limits)
- [ ] Collection pages with aggregated stats
  - Floor price
  - Total volume
  - Number of owners
  - Listed count
- [ ] Favorites/watchlist functionality
- [ ] Royalty display (EIP-2981 support)
- [ ] Price history charts
- [ ] Advanced filtering (price range, traits, status)
- [ ] Sort options (price low/high, recent, etc.)

### Phase 3 - Advanced (Future Consideration)

- [ ] Batch listings/purchases
- [ ] Collection-wide offers
- [ ] Rarity rankings integration
- [ ] Analytics dashboard
- [ ] Notification system
- [ ] Multi-chain support
- [ ] Lazy minting
- [ ] Creator verification badges

---

## Smart Contract Architecture

### Core Contracts

```
contracts/
├── NFTMarketplace.sol      # Main marketplace logic
├── interfaces/
│   ├── INFTMarketplace.sol # Marketplace interface
│   └── IERC721.sol         # ERC-721 interface (OpenZeppelin)
└── libraries/
    └── OrderTypes.sol      # Struct definitions for listings
```

### NFTMarketplace.sol - Core Functions

```solidity
// Listing Management
function listNFT(address nftContract, uint256 tokenId, uint256 price) external;
function cancelListing(address nftContract, uint256 tokenId) external;
function updateListingPrice(address nftContract, uint256 tokenId, uint256 newPrice) external;

// Purchasing
function buyNFT(address nftContract, uint256 tokenId) external payable;

// View Functions
function getListing(address nftContract, uint256 tokenId) external view returns (Listing memory);
function getListingsByseller(address seller) external view returns (Listing[] memory);

// Admin
function setPlatformFee(uint256 fee) external onlyOwner;
function withdrawFees() external onlyOwner;
```

### Data Structures

```solidity
struct Listing {
    address seller;
    address nftContract;
    uint256 tokenId;
    uint256 price;
    uint256 listedAt;
    bool active;
}
```

### Events

```solidity
event NFTListed(address indexed seller, address indexed nftContract, uint256 indexed tokenId, uint256 price);
event NFTSold(address indexed buyer, address indexed nftContract, uint256 indexed tokenId, uint256 price);
event ListingCancelled(address indexed seller, address indexed nftContract, uint256 indexed tokenId);
event ListingPriceUpdated(address indexed nftContract, uint256 indexed tokenId, uint256 oldPrice, uint256 newPrice);
```

### Security Considerations

- Reentrancy protection (ReentrancyGuard)
- Proper access control (only seller can cancel/update)
- Check-Effects-Interactions pattern
- Validate NFT ownership before listing
- Validate listing exists and is active before purchase
- Safe ETH transfers (call with gas limit)
- No approval storage (check approval at execution time)

---

## Frontend Architecture

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Homepage
│   ├── explore/
│   │   └── page.tsx                # Browse all listings
│   ├── nft/
│   │   └── [contract]/[tokenId]/
│   │       └── page.tsx            # NFT detail page
│   ├── profile/
│   │   └── [address]/
│   │       └── page.tsx            # User profile
│   └── api/                        # API routes if needed
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── nft/
│   │   ├── NFTCard.tsx
│   │   ├── NFTGrid.tsx
│   │   ├── NFTDetails.tsx
│   │   └── NFTTraits.tsx
│   ├── marketplace/
│   │   ├── ListingModal.tsx
│   │   ├── BuyButton.tsx
│   │   └── PriceDisplay.tsx
│   ├── wallet/
│   │   ├── ConnectButton.tsx
│   │   └── AccountMenu.tsx
│   └── common/
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── Loading.tsx
│       └── SearchBar.tsx
├── hooks/
│   ├── useMarketplace.ts           # Contract interactions
│   ├── useNFT.ts                   # NFT data fetching
│   ├── useListings.ts              # Active listings
│   └── useUserNFTs.ts              # User's NFTs
├── lib/
│   ├── contracts.ts                # Contract addresses & ABIs
│   ├── alchemy.ts                  # Alchemy SDK setup
│   └── utils.ts                    # Helper functions
├── types/
│   └── index.ts                    # TypeScript types
└── config/
    └── wagmi.ts                    # Wagmi configuration
```

---

## API Integration

### Alchemy NFT API Endpoints Used

| Purpose | Endpoint |
|---------|----------|
| Get NFTs by owner | `getNFTsForOwner` |
| Get NFT metadata | `getNFTMetadata` |
| Get collection metadata | `getContractMetadata` |
| Get NFT sales | `getNFTSales` |
| Refresh metadata | `refreshNftMetadata` |

---

## Database Schema (Optional - for caching/indexing)

If we add a backend for caching:

```
listings
├── id
├── nft_contract
├── token_id
├── seller
├── price
├── status (active, sold, cancelled)
├── listed_at
├── sold_at
└── buyer

activity
├── id
├── type (list, sale, cancel, transfer)
├── nft_contract
├── token_id
├── from_address
├── to_address
├── price
├── tx_hash
└── timestamp
```

---

## Development Phases

### Phase 1: Smart Contracts (Week 1-2)
1. Set up Hardhat project
2. Implement NFTMarketplace contract
3. Write comprehensive tests
4. Deploy to Sepolia
5. Verify on Etherscan

### Phase 2: Frontend Foundation (Week 2-3)
1. Set up Next.js project with Tailwind
2. Configure wagmi + wallet connection
3. Set up Alchemy SDK
4. Build component library
5. Implement basic routing

### Phase 3: Core Features (Week 3-4)
1. NFT browsing and display
2. Listing functionality
3. Buying functionality
4. User profiles

### Phase 4: Polish & Deploy (Week 4-5)
1. Error handling and edge cases
2. Loading states and UX improvements
3. Mobile responsiveness
4. Testing on Sepolia
5. Deploy frontend (Vercel)

---

## Environment Variables

```env
# Blockchain
NEXT_PUBLIC_ALCHEMY_API_KEY=
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=
NEXT_PUBLIC_MARKETPLACE_ADDRESS=

# Hardhat
SEPOLIA_RPC_URL=
PRIVATE_KEY=
ETHERSCAN_API_KEY=
```

---

## Testing Strategy

### Smart Contracts
- Unit tests for all functions
- Integration tests for full flows
- Edge cases (zero price, non-existent listings, etc.)
- Access control tests
- Reentrancy attack tests

### Frontend
- Component unit tests (Jest + React Testing Library)
- Integration tests for user flows
- E2E tests with Cypress (optional)

---

## Deployment

### Smart Contracts
- Sepolia testnet via Hardhat
- Verify on Etherscan
- Document deployed addresses

### Frontend
- Vercel deployment
- Environment variables in Vercel dashboard
- Preview deployments for PRs

---

## Repository Structure

```
NFT-Marketplace/
├── contracts/                 # Solidity contracts
├── scripts/                   # Deployment scripts
├── test/                      # Contract tests
├── frontend/                  # Next.js application
├── hardhat.config.ts
├── package.json
├── SPECIFICATION.md
└── README.md
```
