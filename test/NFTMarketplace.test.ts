import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { NFTMarketplace, MockERC721 } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("NFTMarketplace", function () {
  const PLATFORM_FEE = 250; // 2.5%
  const LISTING_PRICE = ethers.parseEther("1");

  async function deployMarketplaceFixture() {
    const [owner, seller, buyer, other] = await ethers.getSigners();

    const MockERC721Factory = await ethers.getContractFactory("MockERC721");
    const mockNFT = await MockERC721Factory.deploy();

    const MarketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
    const marketplace = await MarketplaceFactory.deploy(PLATFORM_FEE);

    // Mint NFT to seller
    await mockNFT.mint(seller.address);

    return { marketplace, mockNFT, owner, seller, buyer, other };
  }

  async function listingFixture() {
    const { marketplace, mockNFT, owner, seller, buyer, other } =
      await loadFixture(deployMarketplaceFixture);

    // Approve marketplace and list NFT
    await mockNFT.connect(seller).approve(await marketplace.getAddress(), 0);
    await marketplace.connect(seller).listNFT(await mockNFT.getAddress(), 0, LISTING_PRICE);

    return { marketplace, mockNFT, owner, seller, buyer, other };
  }

  describe("Deployment", function () {
    it("should set the correct platform fee", async function () {
      const { marketplace } = await loadFixture(deployMarketplaceFixture);
      expect(await marketplace.platformFee()).to.equal(PLATFORM_FEE);
    });

    it("should set the correct owner", async function () {
      const { marketplace, owner } = await loadFixture(deployMarketplaceFixture);
      expect(await marketplace.owner()).to.equal(owner.address);
    });

    it("should revert if platform fee exceeds maximum", async function () {
      const MarketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
      await expect(MarketplaceFactory.deploy(1001)).to.be.revertedWithCustomError(
        await MarketplaceFactory.deploy(100),
        "FeeTooHigh"
      );
    });
  });

  describe("Listing NFTs", function () {
    it("should list an NFT successfully", async function () {
      const { marketplace, mockNFT, seller } = await loadFixture(deployMarketplaceFixture);

      await mockNFT.connect(seller).approve(await marketplace.getAddress(), 0);

      await expect(
        marketplace.connect(seller).listNFT(await mockNFT.getAddress(), 0, LISTING_PRICE)
      )
        .to.emit(marketplace, "NFTListed")
        .withArgs(seller.address, await mockNFT.getAddress(), 0, LISTING_PRICE);

      const listing = await marketplace.getListing(await mockNFT.getAddress(), 0);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(LISTING_PRICE);
      expect(listing.active).to.be.true;
    });

    it("should revert when listing with zero price", async function () {
      const { marketplace, mockNFT, seller } = await loadFixture(deployMarketplaceFixture);

      await mockNFT.connect(seller).approve(await marketplace.getAddress(), 0);

      await expect(
        marketplace.connect(seller).listNFT(await mockNFT.getAddress(), 0, 0)
      ).to.be.revertedWithCustomError(marketplace, "PriceCannotBeZero");
    });

    it("should revert when lister is not the owner", async function () {
      const { marketplace, mockNFT, other } = await loadFixture(deployMarketplaceFixture);

      await expect(
        marketplace.connect(other).listNFT(await mockNFT.getAddress(), 0, LISTING_PRICE)
      ).to.be.revertedWithCustomError(marketplace, "NotTokenOwner");
    });

    it("should revert when marketplace is not approved", async function () {
      const { marketplace, mockNFT, seller } = await loadFixture(deployMarketplaceFixture);

      await expect(
        marketplace.connect(seller).listNFT(await mockNFT.getAddress(), 0, LISTING_PRICE)
      ).to.be.revertedWithCustomError(marketplace, "NotApprovedForMarketplace");
    });

    it("should allow listing with setApprovalForAll", async function () {
      const { marketplace, mockNFT, seller } = await loadFixture(deployMarketplaceFixture);

      await mockNFT.connect(seller).setApprovalForAll(await marketplace.getAddress(), true);

      await expect(
        marketplace.connect(seller).listNFT(await mockNFT.getAddress(), 0, LISTING_PRICE)
      ).to.emit(marketplace, "NFTListed");
    });
  });

  describe("Buying NFTs", function () {
    it("should allow buying a listed NFT", async function () {
      const { marketplace, mockNFT, seller, buyer } = await loadFixture(listingFixture);

      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

      await expect(
        marketplace.connect(buyer).buyNFT(await mockNFT.getAddress(), 0, { value: LISTING_PRICE })
      )
        .to.emit(marketplace, "NFTSold")
        .withArgs(buyer.address, await mockNFT.getAddress(), 0, LISTING_PRICE);

      // Check NFT ownership transferred
      expect(await mockNFT.ownerOf(0)).to.equal(buyer.address);

      // Check seller received payment minus fee
      const expectedFee = (LISTING_PRICE * BigInt(PLATFORM_FEE)) / 10000n;
      const expectedProceeds = LISTING_PRICE - expectedFee;
      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(expectedProceeds);

      // Check listing is no longer active
      const listing = await marketplace.getListing(await mockNFT.getAddress(), 0);
      expect(listing.active).to.be.false;
    });

    it("should accumulate platform fees", async function () {
      const { marketplace, mockNFT, buyer } = await loadFixture(listingFixture);

      await marketplace.connect(buyer).buyNFT(await mockNFT.getAddress(), 0, { value: LISTING_PRICE });

      const expectedFee = (LISTING_PRICE * BigInt(PLATFORM_FEE)) / 10000n;
      expect(await marketplace.accumulatedFees()).to.equal(expectedFee);
    });

    it("should refund excess payment", async function () {
      const { marketplace, mockNFT, buyer } = await loadFixture(listingFixture);

      const excessAmount = ethers.parseEther("0.5");
      const totalPayment = LISTING_PRICE + excessAmount;

      const buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);

      const tx = await marketplace.connect(buyer).buyNFT(
        await mockNFT.getAddress(),
        0,
        { value: totalPayment }
      );
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);

      // Buyer should have paid only LISTING_PRICE + gas
      expect(buyerBalanceBefore - buyerBalanceAfter - gasUsed).to.equal(LISTING_PRICE);
    });

    it("should revert when listing is not active", async function () {
      const { marketplace, mockNFT, buyer } = await loadFixture(deployMarketplaceFixture);

      await expect(
        marketplace.connect(buyer).buyNFT(await mockNFT.getAddress(), 0, { value: LISTING_PRICE })
      ).to.be.revertedWithCustomError(marketplace, "ListingNotActive");
    });

    it("should revert with insufficient payment", async function () {
      const { marketplace, mockNFT, buyer } = await loadFixture(listingFixture);

      const insufficientAmount = ethers.parseEther("0.5");

      await expect(
        marketplace.connect(buyer).buyNFT(await mockNFT.getAddress(), 0, { value: insufficientAmount })
      ).to.be.revertedWithCustomError(marketplace, "InsufficientPayment");
    });
  });

  describe("Cancelling Listings", function () {
    it("should allow seller to cancel listing", async function () {
      const { marketplace, mockNFT, seller } = await loadFixture(listingFixture);

      await expect(marketplace.connect(seller).cancelListing(await mockNFT.getAddress(), 0))
        .to.emit(marketplace, "ListingCancelled")
        .withArgs(seller.address, await mockNFT.getAddress(), 0);

      const listing = await marketplace.getListing(await mockNFT.getAddress(), 0);
      expect(listing.active).to.be.false;
    });

    it("should revert when non-seller tries to cancel", async function () {
      const { marketplace, mockNFT, other } = await loadFixture(listingFixture);

      await expect(
        marketplace.connect(other).cancelListing(await mockNFT.getAddress(), 0)
      ).to.be.revertedWithCustomError(marketplace, "NotSeller");
    });

    it("should revert when cancelling inactive listing", async function () {
      const { marketplace, mockNFT, seller } = await loadFixture(listingFixture);

      await marketplace.connect(seller).cancelListing(await mockNFT.getAddress(), 0);

      await expect(
        marketplace.connect(seller).cancelListing(await mockNFT.getAddress(), 0)
      ).to.be.revertedWithCustomError(marketplace, "ListingNotActive");
    });
  });

  describe("Updating Listing Price", function () {
    it("should allow seller to update price", async function () {
      const { marketplace, mockNFT, seller } = await loadFixture(listingFixture);

      const newPrice = ethers.parseEther("2");

      await expect(
        marketplace.connect(seller).updateListingPrice(await mockNFT.getAddress(), 0, newPrice)
      )
        .to.emit(marketplace, "ListingPriceUpdated")
        .withArgs(await mockNFT.getAddress(), 0, LISTING_PRICE, newPrice);

      const listing = await marketplace.getListing(await mockNFT.getAddress(), 0);
      expect(listing.price).to.equal(newPrice);
    });

    it("should revert when non-seller tries to update", async function () {
      const { marketplace, mockNFT, other } = await loadFixture(listingFixture);

      await expect(
        marketplace.connect(other).updateListingPrice(await mockNFT.getAddress(), 0, ethers.parseEther("2"))
      ).to.be.revertedWithCustomError(marketplace, "NotSeller");
    });

    it("should revert when updating to zero price", async function () {
      const { marketplace, mockNFT, seller } = await loadFixture(listingFixture);

      await expect(
        marketplace.connect(seller).updateListingPrice(await mockNFT.getAddress(), 0, 0)
      ).to.be.revertedWithCustomError(marketplace, "PriceCannotBeZero");
    });

    it("should revert when updating inactive listing", async function () {
      const { marketplace, mockNFT, seller } = await loadFixture(listingFixture);

      await marketplace.connect(seller).cancelListing(await mockNFT.getAddress(), 0);

      await expect(
        marketplace.connect(seller).updateListingPrice(await mockNFT.getAddress(), 0, ethers.parseEther("2"))
      ).to.be.revertedWithCustomError(marketplace, "ListingNotActive");
    });
  });

  describe("Platform Fee Management", function () {
    it("should allow owner to update platform fee", async function () {
      const { marketplace, owner } = await loadFixture(deployMarketplaceFixture);

      const newFee = 500; // 5%

      await expect(marketplace.connect(owner).setPlatformFee(newFee))
        .to.emit(marketplace, "PlatformFeeUpdated")
        .withArgs(PLATFORM_FEE, newFee);

      expect(await marketplace.platformFee()).to.equal(newFee);
    });

    it("should revert when non-owner tries to update fee", async function () {
      const { marketplace, other } = await loadFixture(deployMarketplaceFixture);

      await expect(
        marketplace.connect(other).setPlatformFee(500)
      ).to.be.revertedWithCustomError(marketplace, "OwnableUnauthorizedAccount");
    });

    it("should revert when fee exceeds maximum", async function () {
      const { marketplace, owner } = await loadFixture(deployMarketplaceFixture);

      await expect(
        marketplace.connect(owner).setPlatformFee(1001)
      ).to.be.revertedWithCustomError(marketplace, "FeeTooHigh");
    });

    it("should allow owner to withdraw accumulated fees", async function () {
      const { marketplace, mockNFT, owner, buyer } = await loadFixture(listingFixture);

      // Buy NFT to generate fees
      await marketplace.connect(buyer).buyNFT(await mockNFT.getAddress(), 0, { value: LISTING_PRICE });

      const expectedFee = (LISTING_PRICE * BigInt(PLATFORM_FEE)) / 10000n;
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

      const tx = await marketplace.connect(owner).withdrawFees();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

      expect(ownerBalanceAfter - ownerBalanceBefore + gasUsed).to.equal(expectedFee);
      expect(await marketplace.accumulatedFees()).to.equal(0);
    });

    it("should revert when non-owner tries to withdraw", async function () {
      const { marketplace, mockNFT, buyer, other } = await loadFixture(listingFixture);

      await marketplace.connect(buyer).buyNFT(await mockNFT.getAddress(), 0, { value: LISTING_PRICE });

      await expect(
        marketplace.connect(other).withdrawFees()
      ).to.be.revertedWithCustomError(marketplace, "OwnableUnauthorizedAccount");
    });

    it("should revert when no fees to withdraw", async function () {
      const { marketplace, owner } = await loadFixture(deployMarketplaceFixture);

      await expect(
        marketplace.connect(owner).withdrawFees()
      ).to.be.revertedWithCustomError(marketplace, "NoFeesToWithdraw");
    });
  });

  describe("Edge Cases", function () {
    it("should handle relisting after cancellation", async function () {
      const { marketplace, mockNFT, seller } = await loadFixture(listingFixture);

      await marketplace.connect(seller).cancelListing(await mockNFT.getAddress(), 0);

      const newPrice = ethers.parseEther("2");
      await expect(
        marketplace.connect(seller).listNFT(await mockNFT.getAddress(), 0, newPrice)
      ).to.emit(marketplace, "NFTListed");

      const listing = await marketplace.getListing(await mockNFT.getAddress(), 0);
      expect(listing.price).to.equal(newPrice);
      expect(listing.active).to.be.true;
    });

    it("should handle multiple NFTs from same collection", async function () {
      const { marketplace, mockNFT, seller, buyer } = await loadFixture(deployMarketplaceFixture);

      // Mint more NFTs
      await mockNFT.mint(seller.address); // tokenId 1
      await mockNFT.mint(seller.address); // tokenId 2

      await mockNFT.connect(seller).setApprovalForAll(await marketplace.getAddress(), true);

      // List all three
      await marketplace.connect(seller).listNFT(await mockNFT.getAddress(), 0, ethers.parseEther("1"));
      await marketplace.connect(seller).listNFT(await mockNFT.getAddress(), 1, ethers.parseEther("2"));
      await marketplace.connect(seller).listNFT(await mockNFT.getAddress(), 2, ethers.parseEther("3"));

      // Buy one
      await marketplace.connect(buyer).buyNFT(await mockNFT.getAddress(), 1, { value: ethers.parseEther("2") });

      // Verify states
      expect((await marketplace.getListing(await mockNFT.getAddress(), 0)).active).to.be.true;
      expect((await marketplace.getListing(await mockNFT.getAddress(), 1)).active).to.be.false;
      expect((await marketplace.getListing(await mockNFT.getAddress(), 2)).active).to.be.true;
    });

    it("should handle NFTs from different collections", async function () {
      const { marketplace, mockNFT, seller } = await loadFixture(deployMarketplaceFixture);

      // Deploy second NFT collection
      const MockERC721Factory = await ethers.getContractFactory("MockERC721");
      const mockNFT2 = await MockERC721Factory.deploy();
      await mockNFT2.mint(seller.address);

      await mockNFT.connect(seller).approve(await marketplace.getAddress(), 0);
      await mockNFT2.connect(seller).approve(await marketplace.getAddress(), 0);

      await marketplace.connect(seller).listNFT(await mockNFT.getAddress(), 0, ethers.parseEther("1"));
      await marketplace.connect(seller).listNFT(await mockNFT2.getAddress(), 0, ethers.parseEther("2"));

      const listing1 = await marketplace.getListing(await mockNFT.getAddress(), 0);
      const listing2 = await marketplace.getListing(await mockNFT2.getAddress(), 0);

      expect(listing1.price).to.equal(ethers.parseEther("1"));
      expect(listing2.price).to.equal(ethers.parseEther("2"));
    });
  });
});
