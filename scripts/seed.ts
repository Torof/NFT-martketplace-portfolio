import { ethers } from "hardhat";

// Update these addresses after deployment
const MARKETPLACE_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const MOCK_NFT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

async function main() {
  const [owner, seller1, seller2, seller3] = await ethers.getSigners();

  console.log("Seeding data with accounts:");
  console.log("- Owner:", owner.address);
  console.log("- Seller1:", seller1.address);
  console.log("- Seller2:", seller2.address);
  console.log("- Seller3:", seller3.address);

  // Get contract instances
  const marketplace = await ethers.getContractAt("NFTMarketplace", MARKETPLACE_ADDRESS);
  const mockNFT = await ethers.getContractAt("MockERC721", MOCK_NFT_ADDRESS);

  // Mint NFTs to sellers
  console.log("\nMinting 24 NFTs...");

  // Mint 8 NFTs to seller1
  for (let i = 0; i < 8; i++) {
    const tx = await mockNFT.connect(owner).mint(seller1.address);
    await tx.wait();
    console.log(`Minted NFT #${i} to seller1`);
  }

  // Mint 8 NFTs to seller2
  for (let i = 0; i < 8; i++) {
    const tx = await mockNFT.connect(owner).mint(seller2.address);
    await tx.wait();
    console.log(`Minted NFT #${i + 8} to seller2`);
  }

  // Mint 8 NFTs to seller3
  for (let i = 0; i < 8; i++) {
    const tx = await mockNFT.connect(owner).mint(seller3.address);
    await tx.wait();
    console.log(`Minted NFT #${i + 16} to seller3`);
  }

  // Approve marketplace for all NFTs
  console.log("\nApproving marketplace...");
  await (await mockNFT.connect(seller1).setApprovalForAll(MARKETPLACE_ADDRESS, true)).wait();
  await (await mockNFT.connect(seller2).setApprovalForAll(MARKETPLACE_ADDRESS, true)).wait();
  await (await mockNFT.connect(seller3).setApprovalForAll(MARKETPLACE_ADDRESS, true)).wait();

  // List NFTs with varied prices
  console.log("\nListing NFTs...");

  const prices = [
    "0.15", "0.25", "0.5", "0.75", "1.0", "1.25", "1.5", "2.0",
    "0.3", "0.45", "0.8", "1.1", "1.75", "2.5", "3.0", "0.6",
    "0.2", "0.35", "0.9", "1.3", "1.8", "2.25", "0.4", "0.55"
  ];

  // List NFTs from seller1 (tokens 0-6, keep #7 unlisted)
  for (let i = 0; i < 7; i++) {
    const tx = await marketplace
      .connect(seller1)
      .listNFT(MOCK_NFT_ADDRESS, i, ethers.parseEther(prices[i]));
    await tx.wait();
    console.log(`Listed NFT #${i} for ${prices[i]} ETH`);
  }

  // List NFTs from seller2 (tokens 8-14, keep #15 unlisted)
  for (let i = 8; i < 15; i++) {
    const tx = await marketplace
      .connect(seller2)
      .listNFT(MOCK_NFT_ADDRESS, i, ethers.parseEther(prices[i]));
    await tx.wait();
    console.log(`Listed NFT #${i} for ${prices[i]} ETH`);
  }

  // List NFTs from seller3 (tokens 16-22, keep #23 unlisted)
  for (let i = 16; i < 23; i++) {
    const tx = await marketplace
      .connect(seller3)
      .listNFT(MOCK_NFT_ADDRESS, i, ethers.parseEther(prices[i]));
    await tx.wait();
    console.log(`Listed NFT #${i} for ${prices[i]} ETH`);
  }

  console.log("\n--- Seed Complete ---");
  console.log("Total NFTs minted: 24");
  console.log("Active listings: 21");
  console.log("Unlisted NFTs: #7, #15, #23");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
