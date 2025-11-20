import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying NFTMarketplace to Sepolia...");
  console.log("Deployer address:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy NFTMarketplace with 2.5% platform fee
  const platformFee = 250;
  const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");

  console.log("Deploying...");
  const marketplace = await NFTMarketplace.deploy(platformFee);
  await marketplace.waitForDeployment();

  const marketplaceAddress = await marketplace.getAddress();

  console.log("\n========================================");
  console.log("NFTMarketplace deployed successfully!");
  console.log("========================================");
  console.log("Address:", marketplaceAddress);
  console.log("Platform Fee: 2.5%");
  console.log("Network: Sepolia");
  console.log("\nVerify on Etherscan:");
  console.log(`npx hardhat verify --network sepolia ${marketplaceAddress} ${platformFee}`);
  console.log("\nUpdate frontend config with this address!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
