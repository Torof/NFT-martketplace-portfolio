import { ethers } from "hardhat";

// Update these addresses after deployment
const MARKETPLACE_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const MOCK_NFT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

async function main() {
  const [owner, seller1, seller2] = await ethers.getSigners();

  console.log("Seeding data with accounts:");
  console.log("- Owner:", owner.address);
  console.log("- Seller1:", seller1.address);
  console.log("- Seller2:", seller2.address);

  // Get contract instances
  const marketplace = await ethers.getContractAt("NFTMarketplace", MARKETPLACE_ADDRESS);
  const mockNFT = await ethers.getContractAt("MockERC721", MOCK_NFT_ADDRESS);

  // Mint NFTs to sellers
  console.log("\nMinting NFTs...");

  // Mint 3 NFTs to seller1
  for (let i = 0; i < 3; i++) {
    const tx = await mockNFT.connect(owner).mint(seller1.address);
    await tx.wait();
    console.log(`Minted NFT #${i} to seller1`);
  }

  // Mint 2 NFTs to seller2
  for (let i = 0; i < 2; i++) {
    const tx = await mockNFT.connect(owner).mint(seller2.address);
    await tx.wait();
    console.log(`Minted NFT #${i + 3} to seller2`);
  }

  // Approve marketplace for all NFTs
  console.log("\nApproving marketplace...");
  await (await mockNFT.connect(seller1).setApprovalForAll(MARKETPLACE_ADDRESS, true)).wait();
  await (await mockNFT.connect(seller2).setApprovalForAll(MARKETPLACE_ADDRESS, true)).wait();

  // List some NFTs
  console.log("\nListing NFTs...");

  const listings = [
    { seller: seller1, tokenId: 0, price: ethers.parseEther("0.5") },
    { seller: seller1, tokenId: 1, price: ethers.parseEther("1.0") },
    { seller: seller2, tokenId: 3, price: ethers.parseEther("0.75") },
    { seller: seller2, tokenId: 4, price: ethers.parseEther("2.0") },
  ];

  for (const listing of listings) {
    const tx = await marketplace
      .connect(listing.seller)
      .listNFT(MOCK_NFT_ADDRESS, listing.tokenId, listing.price);
    await tx.wait();
    console.log(
      `Listed NFT #${listing.tokenId} for ${ethers.formatEther(listing.price)} ETH`
    );
  }

  console.log("\n--- Seed Complete ---");
  console.log("Active listings: 4");
  console.log("Unlisted NFT (seller1): #2");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
