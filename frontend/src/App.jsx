import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

function Instructions() {
  return (
    <div className="instructions card" style={{ marginBottom: 24 }}>
      <h2>How to Use This Demo</h2>
      <div style={{paddingLeft: 15, paddingRight: 15}}>
      <ol>
        <li>Connect your MetaMask wallet (make sure you are on the <b>Sepolia</b> testnet).[Note: To test this demo you will need ETH in your wallet. Here is a faucet where you can get ETH: <a>https://faucet.polygon.technology/</a>]</li>
        <li>Enter a Token URI (use the sample below or your own IPFS link):<br/>
          <code style={{wordBreak: 'break-all', background: '#f4f4f4', padding: '4px 8px', borderRadius: 4, display: 'block', marginTop: 8}}>
            https://ipfs.io/ipfs/bafkreie4a4mnwjhqyljfnqbxq3w36g3cocectn5v5i2fagirsjmpcld5wu
          </code>
        </li>
        <li>Click <b>Generate Signature</b> to get a valid signature from the backend.</li>
        <li>Click <b>Mint NFT</b> and confirm the transaction in MetaMask.</li>
      </ol>
      </div>
      <p style={{marginTop: 12}}>
        <b>Note:</b> This demo mints NFTs on the Sepolia testnet. NFTs may not appear in your wallet UI, but you can always verify the transaction and token on Sepolia Etherscan.
      </p>
    </div>
  );
}

function Info({ txHash }) {
  return (
    <div className="info card" style={{ marginTop: 32, background: '#f8f9fa' }}>
      <h2>What to Expect & How to Verify</h2>
      <div style={{paddingLeft: 15, paddingRight: 15}}>
        <ul>
          <li>After minting, you will see a success message if the transaction is confirmed.</li>
          <li>Your NFT is minted on the <b>Sepolia testnet</b> and may not appear in your wallet UI.</li>
          <li>You can view the transaction details and proof on <b>Sepolia Etherscan</b>!</li>
          
          
            <div style={{margin: '24px 0', textAlign: 'center'}}>
              <a
                href={txHash ? `https://sepolia.etherscan.io/tx/${txHash}` : undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success"
                style={{
                  display: 'inline-block',
                  background: txHash ? '#28a745' : '#b7e2c4',
                  color: txHash ? 'white' : '#e6e6e6',
                  fontWeight: 600,
                  fontSize: '1.2rem',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(102,126,234,0.10)',
                  transition: 'background 0.2s',
                  pointerEvents: txHash ? 'auto' : 'none',
                  opacity: txHash ? 1 : 0.6,
                  cursor: txHash ? 'pointer' : 'not-allowed',
                  marginTop: 8,
                  marginBottom: 8,
                }}
              >
                Click here to view your Transaction
              </a>
            </div>
         
        
        </ul>
      </div>
      
    </div>
  );
}

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [tokenURI, setTokenURI] = useState('');
  const [signature, setSignature] = useState('');
  const [signerAddress, setSignerAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [contractABI, setContractABI] = useState(null);
  const [txHash, setTxHash] = useState('');

  useEffect(() => {
    // Load contract ABI
    fetch('/contracts/LazyMintNFT.json')
      .then(response => response.json())
      .then(data => setContractABI(data.abi))
      .catch(error => console.error('Error loading contract ABI:', error));

    // Get signer address from backend
    fetchSignerAddress();
  }, []);

  const fetchSignerAddress = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/signer`);
      setSignerAddress(response.data.signerAddress);
    } catch (error) {
      console.error('Error fetching signer address:', error);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask is not installed!');
      return;
    }

    try {
      setLoading(true);
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      setAccount(accounts[0]);
      setSigner(signer);
      
      if (contractABI) {
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
        setContract(contract);
      }
      
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  const generateSignature = async () => {
    if (!account || !tokenURI) {
      toast.error('Please connect wallet and enter token URI');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${BACKEND_URL}/api/sign`, {
        recipient: account,
        tokenURI: tokenURI
      });
      
      setSignature(response.data.signature);
      toast.success('Signature generated successfully!');
    } catch (error) {
      console.error('Error generating signature:', error);
      toast.error('Failed to generate signature');
    } finally {
      setLoading(false);
    }
  };

  const mintNFT = async () => {
    if (!contract || !signature || !tokenURI) {
      toast.error('Please generate signature and enter token URI');
      return;
    }

    try {
      setLoading(true);
      console.log('Minting with:', account, tokenURI, signature);
      const tx = await contract.mint(account, tokenURI, signature);
      setTxHash(tx.hash);
      toast.info('Minting NFT... Please wait for transaction confirmation.');
      
      await tx.wait();
      toast.success('NFT minted successfully!');
      
      // Clear form
      setTokenURI('');
      setSignature('');
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error('Failed to mint NFT: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <ToastContainer position="top-right" />
      
      
      <div className="container">
        <header className="header">
          <h1>Lazy Mint NFT</h1>
          <p>Mint NFTs with off-chain signatures</p>
        </header>
        <Instructions />
        <main className="main">
          {/* Wallet Connection */}
          <div className="card">
            <h2>Wallet Connection</h2>
            {!account ? (
              <button 
                className="btn btn-primary" 
                onClick={connectWallet}
                disabled={loading}
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            ) : (
              <div className="wallet-info">
                <p><strong>Connected:</strong> {account}</p>
                <p><strong>Signer Address:</strong> {signerAddress}</p>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setAccount(null);
                    setSigner(null);
                    setContract(null);
                  }}
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>

          {/* Minting Form */}
          {account && (
            <div className="card">
              <h2>Mint NFT</h2>
              
              <div className="form-group">
                <label>Token URI:</label>
                <input
                  type="text"
                  value={tokenURI}
                  onChange={(e) => setTokenURI(e.target.value)}
                  placeholder="https://ipfs.io/ipfs/..."
                  className="input"
                />
              </div>

              <div className="form-group">
                <label>Signature:</label>
                <input
                  type="text"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="0x..."
                  className="input"
                />
                <button 
                  className="btn btn-secondary"
                  onClick={generateSignature}
                  disabled={loading || !tokenURI}
                  style={{ marginTop: 12 }}
                >
                  Generate Signature
                </button>
              </div>

              <button 
                className="btn btn-success"
                onClick={mintNFT}
                disabled={loading || !signature || !tokenURI}
              >
                {loading ? 'Minting...' : 'Mint NFT'}
              </button>
            </div>
          )}

          {/* Contract Info */}
          <div className="card">
            <h2>Contract Information</h2>
            <p><strong>Contract Address:</strong> {CONTRACT_ADDRESS}</p>
            <p><strong>Network:</strong> {window.ethereum?.networkVersion ? `Chain ID: ${window.ethereum.networkVersion}` : 'Not connected'}</p>
          </div>
        </main>
        <Info txHash={txHash} />
      </div>
      
    </div>
  );
}

export default App; 
