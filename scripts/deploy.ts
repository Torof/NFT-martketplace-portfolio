import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy NFTMarketplace
  const platformFee = 250; // 2.5%
  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
  const marketplace = await NFTMarketplace.deploy(platformFee);
  await marketplace.waitForDeployment();

  const marketplaceAddress = await marketplace.getAddress();
  console.log("NFTMarketplace deployed to:", marketplaceAddress);

  // Deploy MockERC721 for testing
  const MockERC721 = await ethers.getContractFactory("MockERC721");
  const mockNFT = await MockERC721.deploy();
  await mockNFT.waitForDeployment();

  const mockNFTAddress = await mockNFT.getAddress();
  console.log("MockERC721 deployed to:", mockNFTAddress);

  console.log("\n--- Deployment Summary ---");
  console.log("Marketplace:", marketplaceAddress);
  console.log("MockNFT:", mockNFTAddress);
  console.log("Platform Fee:", platformFee / 100, "%");
  console.log("\nUpdate frontend/src/config/contracts.ts with these addresses");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
