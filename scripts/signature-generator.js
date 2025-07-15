const { ethers } = require("ethers");
require('dotenv').config();

async function generateSignature() {
  // Get the signer from private key
  const signerPrivateKey = process.env.SIGNER_PRIVATE_KEY;
  if (!signerPrivateKey) {
    console.error('SIGNER_PRIVATE_KEY environment variable is required');
    process.exit(1);
  }

  const wallet = new ethers.Wallet(signerPrivateKey);
  
  // Test parameters
  const recipient = "0xD226A2F4e119976513c30B4a6aDffc8Bb132ccCb";
  const tokenURI = "https://ipfs.io/ipfs/bafkreie4a4mnwjhqyljfnqbxq3w36g3cocectn5v5i2fagirsjmpcld5wu";

  console.log("Generating signature for:");
  console.log("Recipient:", recipient);
  console.log("Token URI:", tokenURI);
  console.log("Signer Address:", wallet.address);
  console.log("---");

  // Create the message hash (same as in the smart contract)
  const messageHash = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "string"],
      [recipient, tokenURI]
    )
  );

  // Sign the message
  const signature = await wallet.signMessage(ethers.getBytes(messageHash));

  console.log("Message Hash:", messageHash);
  console.log("Signature:", signature);
  console.log("Signature length:", signature.length);
  console.log("---");
  console.log("Copy this signature to test minting:");
  console.log(signature);
}

generateSignature().catch(console.error); 