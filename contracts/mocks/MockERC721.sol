// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title MockERC721
 * @notice ERC721 with on-chain SVG metadata for testing
 */
contract MockERC721 is ERC721 {
    using Strings for uint256;

    uint256 private _tokenIdCounter;

    // Color palettes for generating unique NFTs
    string[10] private colors = [
        "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
        "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"
    ];

    constructor() ERC721("Abstract Shapes", "SHAPE") {}

    function mint(address to) external returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _mint(to, tokenId);
        return tokenId;
    }

    function mintBatch(address to, uint256 amount) external returns (uint256[] memory) {
        uint256[] memory tokenIds = new uint256[](amount);
        for (uint256 i = 0; i < amount; i++) {
            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;
            _mint(to, tokenId);
            tokenIds[i] = tokenId;
        }
        return tokenIds;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        string memory svg = generateSVG(tokenId);
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Shape #',
                        tokenId.toString(),
                        '", "description": "A unique abstract shape generated on-chain.", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(svg)),
                        '", "attributes": [',
                        '{"trait_type": "Background", "value": "',
                        colors[tokenId % 10],
                        '"},',
                        '{"trait_type": "Pattern", "value": "',
                        getPattern(tokenId),
                        '"},',
                        '{"trait_type": "Generation", "value": ',
                        tokenId.toString(),
                        "}]}"
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function generateSVG(uint256 tokenId) internal view returns (string memory) {
        string memory bgColor = colors[tokenId % 10];
        string memory shapeColor = colors[(tokenId + 5) % 10];
        uint256 pattern = tokenId % 4;

        string memory shapes;

        if (pattern == 0) {
            // Circles
            shapes = string(
                abi.encodePacked(
                    '<circle cx="200" cy="200" r="120" fill="',
                    shapeColor,
                    '" opacity="0.8"/>',
                    '<circle cx="200" cy="200" r="80" fill="',
                    bgColor,
                    '" opacity="0.5"/>',
                    '<circle cx="200" cy="200" r="40" fill="',
                    shapeColor,
                    '"/>'
                )
            );
        } else if (pattern == 1) {
            // Rectangles
            shapes = string(
                abi.encodePacked(
                    '<rect x="80" y="80" width="240" height="240" fill="',
                    shapeColor,
                    '" opacity="0.8" rx="20"/>',
                    '<rect x="120" y="120" width="160" height="160" fill="',
                    bgColor,
                    '" opacity="0.6" rx="10"/>',
                    '<rect x="160" y="160" width="80" height="80" fill="',
                    shapeColor,
                    '" rx="5"/>'
                )
            );
        } else if (pattern == 2) {
            // Triangle pattern
            shapes = string(
                abi.encodePacked(
                    '<polygon points="200,60 340,340 60,340" fill="',
                    shapeColor,
                    '" opacity="0.8"/>',
                    '<polygon points="200,120 300,300 100,300" fill="',
                    bgColor,
                    '" opacity="0.6"/>',
                    '<polygon points="200,180 250,260 150,260" fill="',
                    shapeColor,
                    '"/>'
                )
            );
        } else {
            // Diamond pattern
            shapes = string(
                abi.encodePacked(
                    '<polygon points="200,40 360,200 200,360 40,200" fill="',
                    shapeColor,
                    '" opacity="0.8"/>',
                    '<polygon points="200,100 300,200 200,300 100,200" fill="',
                    bgColor,
                    '" opacity="0.6"/>',
                    '<polygon points="200,150 250,200 200,250 150,200" fill="',
                    shapeColor,
                    '"/>'
                )
            );
        }

        return
            string(
                abi.encodePacked(
                    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">',
                    '<rect width="400" height="400" fill="',
                    bgColor,
                    '"/>',
                    shapes,
                    "</svg>"
                )
            );
    }

    function getPattern(uint256 tokenId) internal pure returns (string memory) {
        uint256 pattern = tokenId % 4;
        if (pattern == 0) return "Circles";
        if (pattern == 1) return "Squares";
        if (pattern == 2) return "Triangles";
        return "Diamonds";
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
}
