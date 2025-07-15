// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract LazyMintNFT is ERC721URIStorage, Ownable {
    using ECDSA for bytes32;
    
    address public signer;
    uint256 public tokenCounter;

    constructor(address _signer) ERC721("LazyMintNFT", "LMN") {
        signer = _signer;
    }

    function mint(address to, string memory tokenURI, bytes memory signature) external {
        // Create the message hash
        bytes32 messageHash = keccak256(abi.encodePacked(to, tokenURI));
        
        // Create the Ethereum signed message hash
        bytes32 ethSignedMessageHash = ECDSA.toEthSignedMessageHash(messageHash);
        
        // Recover the signer
        address recoveredSigner = ECDSA.recover(ethSignedMessageHash, signature);
        
        // Verify the signer
        require(recoveredSigner == signer, "Invalid signature");

        tokenCounter++;
        _mint(to, tokenCounter);
        _setTokenURI(tokenCounter, tokenURI);
    }

    function updateSigner(address _newSigner) external onlyOwner {
        signer = _newSigner;
    }
} 