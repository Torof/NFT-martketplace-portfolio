// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFTMarketplace
 * @notice A marketplace for trading ERC-721 NFTs with fixed-price listings
 */
contract NFTMarketplace is ReentrancyGuard, Ownable {
    // Listing structure
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool active;
    }

    // Platform fee in basis points (e.g., 250 = 2.5%)
    uint256 public platformFee;
    uint256 public constant MAX_PLATFORM_FEE = 1000; // 10% max

    // Mapping from NFT contract => tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) public listings;

    // Accumulated platform fees
    uint256 public accumulatedFees;

    // Events
    event NFTListed(
        address indexed seller,
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 price
    );

    event NFTSold(
        address indexed buyer,
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 price
    );

    event ListingCancelled(
        address indexed seller,
        address indexed nftContract,
        uint256 indexed tokenId
    );

    event ListingPriceUpdated(
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 oldPrice,
        uint256 newPrice
    );

    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);

    // Errors
    error PriceCannotBeZero();
    error NotTokenOwner();
    error NotApprovedForMarketplace();
    error ListingNotActive();
    error NotSeller();
    error InsufficientPayment();
    error TransferFailed();
    error FeeTooHigh();
    error NoFeesToWithdraw();

    constructor(uint256 _platformFee) Ownable(msg.sender) {
        if (_platformFee > MAX_PLATFORM_FEE) revert FeeTooHigh();
        platformFee = _platformFee;
    }

    /**
     * @notice List an NFT for sale
     * @param nftContract The address of the NFT contract
     * @param tokenId The token ID to list
     * @param price The listing price in wei
     */
    function listNFT(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external {
        if (price == 0) revert PriceCannotBeZero();

        IERC721 nft = IERC721(nftContract);

        if (nft.ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (
            nft.getApproved(tokenId) != address(this) &&
            !nft.isApprovedForAll(msg.sender, address(this))
        ) revert NotApprovedForMarketplace();

        listings[nftContract][tokenId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            active: true
        });

        emit NFTListed(msg.sender, nftContract, tokenId, price);
    }

    /**
     * @notice Cancel an active listing
     * @param nftContract The address of the NFT contract
     * @param tokenId The token ID to cancel listing for
     */
    function cancelListing(address nftContract, uint256 tokenId) external {
        Listing storage listing = listings[nftContract][tokenId];

        if (!listing.active) revert ListingNotActive();
        if (listing.seller != msg.sender) revert NotSeller();

        listing.active = false;

        emit ListingCancelled(msg.sender, nftContract, tokenId);
    }

    /**
     * @notice Update the price of an active listing
     * @param nftContract The address of the NFT contract
     * @param tokenId The token ID to update price for
     * @param newPrice The new listing price in wei
     */
    function updateListingPrice(
        address nftContract,
        uint256 tokenId,
        uint256 newPrice
    ) external {
        if (newPrice == 0) revert PriceCannotBeZero();

        Listing storage listing = listings[nftContract][tokenId];

        if (!listing.active) revert ListingNotActive();
        if (listing.seller != msg.sender) revert NotSeller();

        uint256 oldPrice = listing.price;
        listing.price = newPrice;

        emit ListingPriceUpdated(nftContract, tokenId, oldPrice, newPrice);
    }

    /**
     * @notice Buy a listed NFT
     * @param nftContract The address of the NFT contract
     * @param tokenId The token ID to purchase
     */
    function buyNFT(
        address nftContract,
        uint256 tokenId
    ) external payable nonReentrant {
        Listing storage listing = listings[nftContract][tokenId];

        if (!listing.active) revert ListingNotActive();
        if (msg.value < listing.price) revert InsufficientPayment();

        listing.active = false;

        // Calculate fees
        uint256 fee = (listing.price * platformFee) / 10000;
        uint256 sellerProceeds = listing.price - fee;
        accumulatedFees += fee;

        // Transfer NFT to buyer
        IERC721(nftContract).safeTransferFrom(
            listing.seller,
            msg.sender,
            tokenId
        );

        // Transfer payment to seller
        (bool success, ) = payable(listing.seller).call{value: sellerProceeds}(
            ""
        );
        if (!success) revert TransferFailed();

        // Refund excess payment
        if (msg.value > listing.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{
                value: msg.value - listing.price
            }("");
            if (!refundSuccess) revert TransferFailed();
        }

        emit NFTSold(msg.sender, nftContract, tokenId, listing.price);
    }

    /**
     * @notice Get listing details
     * @param nftContract The address of the NFT contract
     * @param tokenId The token ID
     * @return The listing details
     */
    function getListing(
        address nftContract,
        uint256 tokenId
    ) external view returns (Listing memory) {
        return listings[nftContract][tokenId];
    }

    /**
     * @notice Update the platform fee (owner only)
     * @param newFee The new fee in basis points
     */
    function setPlatformFee(uint256 newFee) external onlyOwner {
        if (newFee > MAX_PLATFORM_FEE) revert FeeTooHigh();

        uint256 oldFee = platformFee;
        platformFee = newFee;

        emit PlatformFeeUpdated(oldFee, newFee);
    }

    /**
     * @notice Withdraw accumulated platform fees (owner only)
     */
    function withdrawFees() external onlyOwner {
        uint256 amount = accumulatedFees;
        if (amount == 0) revert NoFeesToWithdraw();

        accumulatedFees = 0;

        (bool success, ) = payable(owner()).call{value: amount}("");
        if (!success) revert TransferFailed();
    }
}
