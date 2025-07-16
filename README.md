# Lazy Mint NFT Demo

This is a full-stack demo for a modern, gas-efficient NFT minting flow using **off-chain signatures** ("lazy minting") on the Ethereum Sepolia testnet. It is designed to showcase best practices for user experience, security, and developer handoff.

---

## 🚀 Purpose

- **Demonstrate lazy minting:** NFTs are only minted on-chain when a user claims them, saving gas and enabling off-chain whitelisting or airdrops.
- **Showcase a clean, modern UI:** Built with React and styled for clarity and professionalism.
- **Provide a client-ready, verifiable workflow:** Users can see their transaction on Sepolia Etherscan and verify the NFT metadata on IPFS.

---

## 🛠️ How It Works

1. **Backend (Node/Express):**
   - Holds the NFT minter's private key (never exposed to the frontend).
   - Generates a cryptographic signature for a given wallet address and token URI.
2. **Frontend (React):**
   - Lets users connect their MetaMask wallet (Sepolia testnet).
   - Users enter a Token URI (IPFS link) and request a signature from the backend.
   - Users submit the signature to the smart contract to mint the NFT.
3. **Smart Contract (Solidity):**
   - Verifies the signature and mints the NFT to the user if valid.

---

## 🧑‍💻 How to Use This Demo

1. **Connect your MetaMask wallet** (make sure you are on the **Sepolia** testnet).
   [Note: To test this demo you will need ETH in your wallet. Here is a faucet where you can get ETH: https://faucet.polygon.technology/]
3. **Enter a Token URI** (use the sample below or your own IPFS link):

   ```
   https://ipfs.io/ipfs/bafkreie4a4mnwjhqyljfnqbxq3w36g3cocectn5v5i2fagirsjmpcld5wu
   ```

4. **Click "Generate Signature"** to get a valid signature from the backend.
5. **Click "Mint NFT"** and confirm the transaction in MetaMask.
6. **After minting,** a green button will appear: "Click here to view your Transaction". Click it to view your transaction on Sepolia Etherscan.

---

## 🔍 How to Find Your Transaction

- After minting, click the green button at the bottom of the page: **"Click here to view your Transaction"**.
- This will open your transaction on [Sepolia Etherscan](https://sepolia.etherscan.io/).
- You can also search for your wallet address or the contract address on Sepolia Etherscan to see all related transactions.
- The NFT metadata can be viewed on IPFS using the Token URI you provided.

---

## 📦 Project Structure

- `frontend/` — React app (UI, wallet connection, minting flow)
- `backend/` — Node/Express server (signature generation)
- `contracts/` — Solidity smart contract (ERC721 lazy mint)

---

## 📝 Notes

- This demo is for educational and demonstration purposes only. Do **not** use the included private keys or backend as-is in production.
- For production, deploy the backend to a secure host (Render, Railway, etc.) and update the frontend's backend URL.
- The contract is deployed on Sepolia testnet. You can redeploy to another network as needed.

---

## 🧑‍💼 For Clients & Reviewers

- This demo is designed to be easy to use and verify.
- All transactions are public and verifiable on Sepolia Etherscan.
- The UI is clean, modern, and ready for handoff or further customization.

---

**Enjoy your lazy minting experience!**
