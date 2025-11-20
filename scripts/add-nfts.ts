import { ethers } from "hardhat";

// Update these addresses after deployment
const MARKETPLACE_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const MOCK_NFT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

async function main() {
  const signers = await ethers.getSigners();
  const [owner, seller1, seller2, seller3] = signers;

  console.log("Adding more NFTs with accounts:");
  console.log("- Owner:", owner.address);
  console.log("- Seller1:", seller1.address);
  console.log("- Seller2:", seller2.address);
  console.log("- Seller3:", seller3.address);

  // Get contract instances
  const marketplace = await ethers.getContractAt("NFTMarketplace", MARKETPLACE_ADDRESS);
  const mockNFT = await ethers.getContractAt("MockERC721", MOCK_NFT_ADDRESS);

  // Get current token count
  const currentSupply = await mockNFT.totalSupply();
  console.log(`\nCurrent NFT supply: ${currentSupply}`);

  const startTokenId = Number(currentSupply);
  const nftsToMint = 20;

  console.log(`\nMinting ${nftsToMint} more NFTs...`);

  const sellers = [seller1, seller2, seller3];
  const mintedTokens: { seller: typeof seller1; tokenId: number }[] = [];

  // Mint NFTs distributed across sellers
  for (let i = 0; i < nftsToMint; i++) {
    const seller = sellers[i % 3];
    const tx = await mockNFT.connect(owner).mint(seller.address);
    await tx.wait();
    const tokenId = startTokenId + i;
    mintedTokens.push({ seller, tokenId });
    console.log(`Minted NFT #${tokenId} to ${seller.address.slice(0, 8)}...`);
  }

  // Ensure marketplace is approved
  console.log("\nApproving marketplace...");
  for (const seller of sellers) {
    const isApproved = await mockNFT.isApprovedForAll(seller.address, MARKETPLACE_ADDRESS);
    if (!isApproved) {
      await (await mockNFT.connect(seller).setApprovalForAll(MARKETPLACE_ADDRESS, true)).wait();
      console.log(`Approved for ${seller.address.slice(0, 8)}...`);
    }
  }

  // List NFTs with varied prices
  console.log("\nListing NFTs...");

  const priceOptions = [
    "0.08", "0.12", "0.18", "0.22", "0.35", "0.42", "0.55", "0.68",
    "0.85", "0.95", "1.15", "1.35", "1.55", "1.85", "2.2", "2.75",
    "3.25", "4.0", "5.5", "7.5"
  ];

  for (let i = 0; i < mintedTokens.length; i++) {
    const { seller, tokenId } = mintedTokens[i];
    const price = priceOptions[i % priceOptions.length];

    const tx = await marketplace
      .connect(seller)
      .listNFT(MOCK_NFT_ADDRESS, tokenId, ethers.parseEther(price));
    await tx.wait();
    console.log(`Listed NFT #${tokenId} for ${price} ETH`);
  }

  const newSupply = await mockNFT.totalSupply();
  console.log("\n--- Complete ---");
  console.log(`Total NFTs now: ${newSupply}`);
  console.log(`New listings added: ${nftsToMint}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
