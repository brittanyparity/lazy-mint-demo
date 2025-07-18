const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { ethers } = require('ethers');
require('dotenv').config();

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Security middleware
app.use(helmet());

// --- PASTE THE CORS BLOCK HERE ---
const allowedOrigins = [
  'https://lazy-mint-demo.vercel.app', // production
  'http://localhost:3000',             // local dev
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      /^https:\/\/lazy-mint-demo-.*\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
// --- END CORS BLOCK ---

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json());

// Initialize wallet from private key
const signerPrivateKey = process.env.SIGNER_PRIVATE_KEY;
if (!signerPrivateKey) {
  console.error('SIGNER_PRIVATE_KEY environment variable is required');
  process.exit(1);
}

const wallet = new ethers.Wallet(signerPrivateKey);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    signerAddress: wallet.address 
  });
});

// Generate signature for lazy minting
app.post('/api/sign', async (req, res) => {
  try {
    const { recipient, tokenURI } = req.body;

    // Validate input
    if (!recipient || !tokenURI) {
      return res.status(400).json({ 
        error: 'Missing required fields: recipient and tokenURI' 
      });
    }

    // Validate Ethereum address
    if (!ethers.isAddress(recipient)) {
      return res.status(400).json({ 
        error: 'Invalid recipient address' 
      });
    }

    // --- REPLACE THIS BLOCK ---
    // const messageHash = ethers.keccak256(
    //   ethers.AbiCoder.defaultAbiCoder().encode(
    //     ["address", "string"],
    //     [recipient, tokenURI]
    //   )
    // );
    // const signature = await wallet.signMessage(ethers.getBytes(messageHash));
    // --- END REPLACE ---

    // --- USE THIS INSTEAD ---
    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "string"],
      [recipient, tokenURI]
    );
    const signature = await wallet.signMessage(ethers.getBytes(messageHash));
    // --- END USE ---

    console.log('Recipient:', recipient);
    console.log('Token URI:', tokenURI);
    console.log('Message Hash:', messageHash);
    console.log('Signature:', signature);
    console.log('Signer Address:', wallet.address);

    res.json({
      signature,
      signerAddress: wallet.address,
      messageHash: messageHash,
      recipient,
      tokenURI
    });
    
  } catch (error) {
    console.error('Error generating signature:', error);
    res.status(500).json({ 
      error: 'Failed to generate signature',
      details: error.message 
    });
  }
});

// Get signer address
app.get('/api/signer', (req, res) => {
  res.json({ 
    signerAddress: wallet.address 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Signer address: ${wallet.address}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
}); 