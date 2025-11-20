// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

/**
 * @title NFTMarketplace
 * @notice A marketplace for trading ERC-721 and ERC-1155 NFTs with fixed-price listings
 */
contract NFTMarketplace is ReentrancyGuard, Ownable, IERC721Receiver, IERC1155Receiver {
    // Token type enum
    enum TokenType {
        ERC721,
        ERC1155
    }

    // Listing structure
    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        uint256 amount; // Always 1 for ERC721, can be >1 for ERC1155
        TokenType tokenType;
        bool active;
    }

    // Platform fee in basis points (e.g., 250 = 2.5%)
    uint256 public platformFee;
    uint256 public constant MAX_PLATFORM_FEE = 1000; // 10% max

    // ERC165 interface IDs
    bytes4 private constant INTERFACE_ID_ERC721 = 0x80ac58cd;
    bytes4 private constant INTERFACE_ID_ERC1155 = 0xd9b67a26;

    // Mapping from NFT contract => tokenId => seller => Listing
    // Using seller in key allows multiple ERC1155 listings of same token
    mapping(address => mapping(uint256 => mapping(address => Listing))) public listings;

    // For backwards compatibility and simpler lookups (ERC721)
    mapping(address => mapping(uint256 => Listing)) public erc721Listings;

    // Accumulated platform fees
    uint256 public accumulatedFees;

    // Events
    event NFTListed(
        address indexed seller,
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 price,
        uint256 amount,
        TokenType tokenType
    );

    event NFTSold(
        address indexed buyer,
        address indexed nftContract,
        uint256 indexed tokenId,
        uint256 price,
        uint256 amount,
        TokenType tokenType
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
    error AmountCannotBeZero();
    error NotTokenOwner();
    error InsufficientBalance();
    error NotApprovedForMarketplace();
    error ListingNotActive();
    error NotSeller();
    error InsufficientPayment();
    error TransferFailed();
    error FeeTooHigh();
    error NoFeesToWithdraw();
    error UnsupportedTokenType();

    constructor(uint256 _platformFee) Ownable(msg.sender) {
        if (_platformFee > MAX_PLATFORM_FEE) revert FeeTooHigh();
        platformFee = _platformFee;
    }

    /**
     * @notice List an ERC721 NFT for sale
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

        // Check if it's ERC721
        if (!_supportsInterface(nftContract, INTERFACE_ID_ERC721)) {
            revert UnsupportedTokenType();
        }

        IERC721 nft = IERC721(nftContract);

        if (nft.ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (
            nft.getApproved(tokenId) != address(this) &&
            !nft.isApprovedForAll(msg.sender, address(this))
        ) revert NotApprovedForMarketplace();

        Listing memory listing = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            amount: 1,
            tokenType: TokenType.ERC721,
            active: true
        });

        erc721Listings[nftContract][tokenId] = listing;
        listings[nftContract][tokenId][msg.sender] = listing;

        emit NFTListed(msg.sender, nftContract, tokenId, price, 1, TokenType.ERC721);
    }

    /**
     * @notice List an ERC1155 NFT for sale
     * @param nftContract The address of the NFT contract
     * @param tokenId The token ID to list
     * @param amount The amount of tokens to list
     * @param price The listing price in wei (total price for all tokens)
     */
    function listERC1155(
        address nftContract,
        uint256 tokenId,
        uint256 amount,
        uint256 price
    ) external {
        if (price == 0) revert PriceCannotBeZero();
        if (amount == 0) revert AmountCannotBeZero();

        // Check if it's ERC1155
        if (!_supportsInterface(nftContract, INTERFACE_ID_ERC1155)) {
            revert UnsupportedTokenType();
        }

        IERC1155 nft = IERC1155(nftContract);

        if (nft.balanceOf(msg.sender, tokenId) < amount) revert InsufficientBalance();
        if (!nft.isApprovedForAll(msg.sender, address(this))) revert NotApprovedForMarketplace();

        Listing memory listing = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            amount: amount,
            tokenType: TokenType.ERC1155,
            active: true
        });

        listings[nftContract][tokenId][msg.sender] = listing;

        emit NFTListed(msg.sender, nftContract, tokenId, price, amount, TokenType.ERC1155);
    }

    /**
     * @notice Cancel an active ERC721 listing
     * @param nftContract The address of the NFT contract
     * @param tokenId The token ID to cancel listing for
     */
    function cancelListing(address nftContract, uint256 tokenId) external {
        Listing storage listing = erc721Listings[nftContract][tokenId];

        if (!listing.active) revert ListingNotActive();
        if (listing.seller != msg.sender) revert NotSeller();

        listing.active = false;
        listings[nftContract][tokenId][msg.sender].active = false;

        emit ListingCancelled(msg.sender, nftContract, tokenId);
    }

    /**
     * @notice Cancel an active ERC1155 listing
     * @param nftContract The address of the NFT contract
     * @param tokenId The token ID to cancel listing for
     */
    function cancelERC1155Listing(address nftContract, uint256 tokenId) external {
        Listing storage listing = listings[nftContract][tokenId][msg.sender];

        if (!listing.active) revert ListingNotActive();
        if (listing.seller != msg.sender) revert NotSeller();

        listing.active = false;

        emit ListingCancelled(msg.sender, nftContract, tokenId);
    }

    /**
     * @notice Update the price of an active ERC721 listing
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

        Listing storage listing = erc721Listings[nftContract][tokenId];

        if (!listing.active) revert ListingNotActive();
        if (listing.seller != msg.sender) revert NotSeller();

        uint256 oldPrice = listing.price;
        listing.price = newPrice;
        listings[nftContract][tokenId][msg.sender].price = newPrice;

        emit ListingPriceUpdated(nftContract, tokenId, oldPrice, newPrice);
    }

    /**
     * @notice Update the price of an active ERC1155 listing
     * @param nftContract The address of the NFT contract
     * @param tokenId The token ID to update price for
     * @param newPrice The new listing price in wei
     */
    function updateERC1155ListingPrice(
        address nftContract,
        uint256 tokenId,
        uint256 newPrice
    ) external {
        if (newPrice == 0) revert PriceCannotBeZero();

        Listing storage listing = listings[nftContract][tokenId][msg.sender];

        if (!listing.active) revert ListingNotActive();
        if (listing.seller != msg.sender) revert NotSeller();

        uint256 oldPrice = listing.price;
        listing.price = newPrice;

        emit ListingPriceUpdated(nftContract, tokenId, oldPrice, newPrice);
    }

    /**
     * @notice Buy a listed ERC721 NFT
     * @param nftContract The address of the NFT contract
     * @param tokenId The token ID to purchase
     */
    function buyNFT(
        address nftContract,
        uint256 tokenId
    ) external payable nonReentrant {
        Listing storage listing = erc721Listings[nftContract][tokenId];

        if (!listing.active) revert ListingNotActive();
        if (msg.value < listing.price) revert InsufficientPayment();

        listing.active = false;
        listings[nftContract][tokenId][listing.seller].active = false;

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

        emit NFTSold(msg.sender, nftContract, tokenId, listing.price, 1, TokenType.ERC721);
    }

    /**
     * @notice Buy a listed ERC1155 NFT
     * @param nftContract The address of the NFT contract
     * @param tokenId The token ID to purchase
     * @param seller The address of the seller
     */
    function buyERC1155(
        address nftContract,
        uint256 tokenId,
        address seller
    ) external payable nonReentrant {
        Listing storage listing = listings[nftContract][tokenId][seller];

        if (!listing.active) revert ListingNotActive();
        if (msg.value < listing.price) revert InsufficientPayment();

        listing.active = false;

        // Calculate fees
        uint256 fee = (listing.price * platformFee) / 10000;
        uint256 sellerProceeds = listing.price - fee;
        accumulatedFees += fee;

        // Transfer NFT to buyer
        IERC1155(nftContract).safeTransferFrom(
            listing.seller,
            msg.sender,
            tokenId,
            listing.amount,
            ""
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

        emit NFTSold(msg.sender, nftContract, tokenId, listing.price, listing.amount, TokenType.ERC1155);
    }

    /**
     * @notice Get ERC721 listing details (backwards compatible)
     * @param nftContract The address of the NFT contract
     * @param tokenId The token ID
     * @return The listing details
     */
    function getListing(
        address nftContract,
        uint256 tokenId
    ) external view returns (Listing memory) {
        return erc721Listings[nftContract][tokenId];
    }

    /**
     * @notice Get ERC1155 listing details
     * @param nftContract The address of the NFT contract
     * @param tokenId The token ID
     * @param seller The seller address
     * @return The listing details
     */
    function getERC1155Listing(
        address nftContract,
        uint256 tokenId,
        address seller
    ) external view returns (Listing memory) {
        return listings[nftContract][tokenId][seller];
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

    /**
     * @notice Check if a contract supports an interface
     */
    function _supportsInterface(address contractAddress, bytes4 interfaceId) internal view returns (bool) {
        try IERC165(contractAddress).supportsInterface(interfaceId) returns (bool supported) {
            return supported;
        } catch {
            return false;
        }
    }

    // ERC721Receiver implementation
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    // ERC1155Receiver implementation
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    // ERC165 support
    function supportsInterface(bytes4 interfaceId) external pure override returns (bool) {
        return
            interfaceId == type(IERC721Receiver).interfaceId ||
            interfaceId == type(IERC1155Receiver).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }
}
