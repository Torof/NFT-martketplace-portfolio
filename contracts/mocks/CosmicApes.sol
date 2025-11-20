// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title CosmicApes
 * @notice ERC721 with on-chain SVG pixel art apes
 */
contract CosmicApes is ERC721 {
    using Strings for uint256;

    uint256 private _tokenIdCounter;

    // Background colors (cosmic themes)
    string[8] private bgColors = [
        "#0a0a2e", "#1a0a2e", "#0a1a2e", "#2e0a2e",
        "#0a2e2e", "#2e1a0a", "#1a2e0a", "#2e0a1a"
    ];

    // Fur colors
    string[8] private furColors = [
        "#8B4513", "#D2691E", "#CD853F", "#DEB887",
        "#FFD700", "#FF6347", "#9370DB", "#00CED1"
    ];

    // Eye colors
    string[6] private eyeColors = [
        "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"
    ];

    constructor() ERC721("Cosmic Apes", "CAPE") {}

    function mint(address to) external returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _mint(to, tokenId);
        return tokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        string memory svg = generateSVG(tokenId);
        string memory imageData = string(abi.encodePacked("data:image/svg+xml;base64,", Base64.encode(bytes(svg))));

        bytes memory jsonBytes = abi.encodePacked(
            '{"name": "Cosmic Ape #', tokenId.toString(),
            '", "description": "A unique cosmic ape generated on-chain.", "image": "', imageData,
            '", "attributes": ', _getAttributes(tokenId), '}'
        );

        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(jsonBytes)));
    }

    function _getAttributes(uint256 tokenId) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '[{"trait_type": "Background", "value": "', getBackgroundName(tokenId),
            '"},{"trait_type": "Fur", "value": "', getFurName(tokenId),
            '"},{"trait_type": "Eyes", "value": "', getEyeName(tokenId),
            '"},{"trait_type": "Generation", "value": ', tokenId.toString(), '}]'
        ));
    }

    function generateSVG(uint256 tokenId) internal view returns (string memory) {
        string memory bgColor = bgColors[tokenId % 8];
        string memory furColor = furColors[(tokenId / 8) % 8];
        string memory eyeColor = eyeColors[(tokenId / 64) % 6];

        return string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" shape-rendering="crispEdges">',
                '<rect width="24" height="24" fill="', bgColor, '"/>',
                _generateStars(),
                _generateApe(furColor, eyeColor),
                '</svg>'
            )
        );
    }

    function _generateStars() internal pure returns (string memory) {
        return '<rect x="2" y="2" width="1" height="1" fill="#FFF" opacity="0.8"/><rect x="20" y="5" width="1" height="1" fill="#FFF" opacity="0.6"/><rect x="5" y="18" width="1" height="1" fill="#FFF"/><rect x="18" y="20" width="1" height="1" fill="#FFF" opacity="0.5"/>';
    }

    function _generateApe(string memory furColor, string memory eyeColor) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                '<rect x="5" y="6" width="2" height="3" fill="', furColor, '"/>',
                '<rect x="17" y="6" width="2" height="3" fill="', furColor, '"/>',
                '<rect x="6" y="5" width="12" height="14" fill="', furColor, '"/>',
                '<rect x="8" y="10" width="8" height="8" fill="#DEB887"/>',
                _generateFace(eyeColor)
            )
        );
    }

    function _generateFace(string memory eyeColor) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                '<rect x="9" y="11" width="2" height="2" fill="#FFF"/>',
                '<rect x="13" y="11" width="2" height="2" fill="#FFF"/>',
                '<rect x="10" y="12" width="1" height="1" fill="', eyeColor, '"/>',
                '<rect x="14" y="12" width="1" height="1" fill="', eyeColor, '"/>',
                '<rect x="11" y="14" width="2" height="1" fill="#8B4513"/>',
                '<rect x="10" y="16" width="4" height="1" fill="#5D3A1A"/>'
            )
        );
    }

    function getBackgroundName(uint256 tokenId) internal pure returns (string memory) {
        uint256 idx = tokenId % 8;
        if (idx == 0) return "Deep Space";
        if (idx == 1) return "Nebula Purple";
        if (idx == 2) return "Ocean Void";
        if (idx == 3) return "Magenta Cosmos";
        if (idx == 4) return "Teal Galaxy";
        if (idx == 5) return "Sunset Dimension";
        if (idx == 6) return "Aurora Zone";
        return "Cherry Nebula";
    }

    function getFurName(uint256 tokenId) internal pure returns (string memory) {
        uint256 idx = (tokenId / 8) % 8;
        if (idx == 0) return "Classic Brown";
        if (idx == 1) return "Chocolate";
        if (idx == 2) return "Tan";
        if (idx == 3) return "Cream";
        if (idx == 4) return "Golden";
        if (idx == 5) return "Crimson";
        if (idx == 6) return "Purple Haze";
        return "Cyber Teal";
    }

    function getEyeName(uint256 tokenId) internal pure returns (string memory) {
        uint256 idx = (tokenId / 64) % 6;
        if (idx == 0) return "Laser Red";
        if (idx == 1) return "Matrix Green";
        if (idx == 2) return "Electric Blue";
        if (idx == 3) return "Solar Yellow";
        if (idx == 4) return "Plasma Pink";
        return "Neon Cyan";
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
}
