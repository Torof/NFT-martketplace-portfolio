import { ethers } from "hardhat";

const MARKETPLACE_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

async function main() {
  const signers = await ethers.getSigners();
  const [owner, seller1, seller2, seller3] = signers;

  console.log("Deploying second NFT collection...\n");

  // Deploy CosmicApes
  const CosmicApes = await ethers.getContractFactory("CosmicApes");
  const cosmicApes = await CosmicApes.deploy();
  await cosmicApes.waitForDeployment();

  const collectionAddress = await cosmicApes.getAddress();
  console.log("Cosmic Apes deployed to:", collectionAddress);

  // Get marketplace
  const marketplace = await ethers.getContractAt("NFTMarketplace", MARKETPLACE_ADDRESS);

  // Mint 15 NFTs distributed across sellers
  console.log("\nMinting 15 Cosmic Apes...");

  const sellers = [seller1, seller2, seller3];
  const mintedTokens: { seller: typeof seller1; tokenId: number }[] = [];

  for (let i = 0; i < 15; i++) {
    const seller = sellers[i % 3];
    const tx = await cosmicApes.connect(owner).mint(seller.address);
    await tx.wait();
    mintedTokens.push({ seller, tokenId: i });
    console.log(`Minted Cosmic Ape #${i} to ${seller.address.slice(0, 8)}...`);
  }

  // Approve marketplace
  console.log("\nApproving marketplace...");
  for (const seller of sellers) {
    await (await cosmicApes.connect(seller).setApprovalForAll(MARKETPLACE_ADDRESS, true)).wait();
  }

  // List with varied prices
  console.log("\nListing Cosmic Apes...");

  const prices = [
    "0.25", "0.4", "0.6", "0.85", "1.2",
    "1.5", "1.9", "2.3", "2.8", "3.5",
    "4.2", "5.0", "6.5", "8.0", "10.0"
  ];

  for (let i = 0; i < mintedTokens.length; i++) {
    const { seller, tokenId } = mintedTokens[i];
    const tx = await marketplace
      .connect(seller)
      .listNFT(collectionAddress, tokenId, ethers.parseEther(prices[i]));
    await tx.wait();
    console.log(`Listed Cosmic Ape #${tokenId} for ${prices[i]} ETH`);
  }

  console.log("\n--- Collection Created ---");
  console.log("Collection: Cosmic Apes (CAPE)");
  console.log("Address:", collectionAddress);
  console.log("Total minted: 15");
  console.log("Total listed: 15");
  console.log("\n⚠️  Update KNOWN_NFT_CONTRACTS in frontend/src/config/contracts.ts:");
  console.log(`   "${collectionAddress}",`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
