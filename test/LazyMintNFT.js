const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LazyMintNFT", function () {
  let lazyMintNFT;
  let owner;
  let signer;
  let user;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, signer, user, addr1, addr2] = await ethers.getSigners();
    
    const LazyMintNFT = await ethers.getContractFactory("LazyMintNFT");
    lazyMintNFT = await LazyMintNFT.deploy(signer.address);
    await lazyMintNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right signer", async function () {
      expect(await lazyMintNFT.signer()).to.equal(signer.address);
    });

    it("Should set the right owner", async function () {
      expect(await lazyMintNFT.owner()).to.equal(owner.address);
    });

    it("Should start with token counter at 0", async function () {
      expect(await lazyMintNFT.tokenCounter()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should mint NFT with valid signature", async function () {
      const tokenURI = "ipfs://QmTest123";
      const recipient = user.address;
      
      // Create the message hash
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "string"],
          [recipient, tokenURI]
        )
      );
      
      // Sign the message
      const signature = await signer.signMessage(ethers.getBytes(messageHash));
      
      // Mint the NFT
      await lazyMintNFT.connect(user).mint(recipient, tokenURI, signature);
      
      expect(await lazyMintNFT.tokenCounter()).to.equal(1);
      expect(await lazyMintNFT.ownerOf(1)).to.equal(recipient);
      expect(await lazyMintNFT.tokenURI(1)).to.equal(tokenURI);
    });

    it("Should increment token counter correctly", async function () {
      const tokenURI1 = "ipfs://QmTest1";
      const tokenURI2 = "ipfs://QmTest2";
      const recipient = user.address;
      
      // Create and sign first message
      const messageHash1 = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "string"],
          [recipient, tokenURI1]
        )
      );
      const signature1 = await signer.signMessage(ethers.getBytes(messageHash1));
      
      // Create and sign second message
      const messageHash2 = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "string"],
          [recipient, tokenURI2]
        )
      );
      const signature2 = await signer.signMessage(ethers.getBytes(messageHash2));
      
      // Mint both NFTs
      await lazyMintNFT.connect(user).mint(recipient, tokenURI1, signature1);
      await lazyMintNFT.connect(user).mint(recipient, tokenURI2, signature2);
      
      expect(await lazyMintNFT.tokenCounter()).to.equal(2);
      expect(await lazyMintNFT.ownerOf(1)).to.equal(recipient);
      expect(await lazyMintNFT.ownerOf(2)).to.equal(recipient);
    });

    it("Should reject minting with invalid signature", async function () {
      const tokenURI = "ipfs://QmTest123";
      const recipient = user.address;
      
      // Create message hash
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "string"],
          [recipient, tokenURI]
        )
      );
      
      // Sign with wrong signer
      const signature = await user.signMessage(ethers.getBytes(messageHash));
      
      await expect(
        lazyMintNFT.connect(user).mint(recipient, tokenURI, signature)
      ).to.be.revertedWith("Invalid signature");
    });

    it("Should reject minting with wrong recipient", async function () {
      const tokenURI = "ipfs://QmTest123";
      const intendedRecipient = user.address;
      const actualRecipient = addr1.address;
      
      // Create message hash for intended recipient
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "string"],
          [intendedRecipient, tokenURI]
        )
      );
      
      // Sign the message
      const signature = await signer.signMessage(ethers.getBytes(messageHash));
      
      // Try to mint to different recipient
      await expect(
        lazyMintNFT.connect(user).mint(actualRecipient, tokenURI, signature)
      ).to.be.revertedWith("Invalid signature");
    });
  });

  describe("Signer Management", function () {
    it("Should allow owner to update signer", async function () {
      const newSigner = addr1.address;
      await lazyMintNFT.connect(owner).updateSigner(newSigner);
      expect(await lazyMintNFT.signer()).to.equal(newSigner);
    });

    it("Should not allow non-owner to update signer", async function () {
      const newSigner = addr1.address;
      await expect(
        lazyMintNFT.connect(user).updateSigner(newSigner)
      ).to.be.revertedWithCustomError(lazyMintNFT, "OwnableUnauthorizedAccount");
    });

    it("Should work with new signer after update", async function () {
      const newSigner = addr1;
      await lazyMintNFT.connect(owner).updateSigner(newSigner.address);
      
      const tokenURI = "ipfs://QmTest123";
      const recipient = user.address;
      
      // Create message hash
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "string"],
          [recipient, tokenURI]
        )
      );
      
      // Sign with new signer
      const signature = await newSigner.signMessage(ethers.getBytes(messageHash));
      
      // Mint should work
      await lazyMintNFT.connect(user).mint(recipient, tokenURI, signature);
      expect(await lazyMintNFT.tokenCounter()).to.equal(1);
    });
  });

  describe("ERC721 Functionality", function () {
    it("Should have correct name and symbol", async function () {
      expect(await lazyMintNFT.name()).to.equal("LazyMintNFT");
      expect(await lazyMintNFT.symbol()).to.equal("LMN");
    });

    it("Should support tokenURI storage", async function () {
      const tokenURI = "ipfs://QmTest123";
      const recipient = user.address;
      
      const messageHash = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "string"],
          [recipient, tokenURI]
        )
      );
      const signature = await signer.signMessage(ethers.getBytes(messageHash));
      
      await lazyMintNFT.connect(user).mint(recipient, tokenURI, signature);
      expect(await lazyMintNFT.tokenURI(1)).to.equal(tokenURI);
    });
  });
}); 