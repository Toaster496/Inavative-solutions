# ComputeMarket Deployment Guide

A step-by-step guide for deploying the ComputeMarket platform.

## Quick Links

- [Main README](../README.md) - Full documentation
- [Prerequisites](#prerequisites) - What you need before starting
- [Deployment Steps](#deployment-steps) - Complete deployment process

---

## Prerequisites Checklist

Before deploying, ensure you have:

- [ ] **Node.js 18+** installed ([Download](https://nodejs.org/))
- [ ] **MetaMask** browser extension installed ([Install](https://metamask.io/))
- [ ] **Git** installed for cloning the repository
- [ ] **Testnet BNB** in your wallet (get from [faucet](https://testnet.binance.org/faucet-smart))

### Optional (for hosting compute)

- [ ] **Docker** installed (for running compute jobs)
- [ ] **NVIDIA drivers** and **Container Toolkit** (for GPU hosting)

---

## Deployment Steps

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd ComputeMarket
```

### Step 2: Deploy Smart Contracts

```bash
# Navigate to contracts directory
cd contracts

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your private key
nano .env  # or use your preferred editor

# Compile contracts
npm run compile

# Deploy to BSC Testnet
npm run deploy:testnet
```

**Important:** Save the contract addresses from the deployment output!

### Step 3: Configure Web App

```bash
# Navigate to web-app directory
cd ../web-app

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with deployed contract addresses
nano .env
```

Update the addresses in `.env`:
```
VITE_COMPUTE_COIN_ADDRESS=0x...  # From Step 2 output
VITE_MARKETPLACE_ADDRESS=0x...   # From Step 2 output
```

### Step 4: Start Web App

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Step 5: Configure Desktop Host (Optional)

If you want to provide compute resources:

```bash
# Navigate to desktop-client directory
cd ../desktop-client

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

Update the configuration:
```
HOST_WALLET_PRIVATE_KEY=your_private_key
MARKETPLACE_ADDRESS=0x...        # From Step 2
COMPUTE_COIN_ADDRESS=0x...       # From Step 2
RPC_URL=https://data-seed-preload1-s1.bscnode.com/
GPU_ID=0
MAX_PRICE_PER_HOUR=10
AUTO_ACCEPT_JOBS=false
```

### Step 6: Start Desktop Host

```bash
npm start
```

---

## Verification

### Verify Contract Deployment

1. Go to [BSC Testnet Explorer](https://testnet.bscscan.com/)
2. Search for your contract addresses
3. Check that contracts are verified and show source code

### Verify Web App

1. Open `http://localhost:5173` in your browser
2. Connect MetaMask wallet
3. Ensure you're on BSC Testnet network
4. Check that contract data loads without errors

### Verify Desktop Host

1. Desktop client should open without errors
2. Check logs for successful connection to blockchain
3. Verify host registration option is available

---

## Troubleshooting

### Common Issues

#### "insufficient funds for gas"
- Get more testnet BNB from faucet
- Check wallet balance on BSCScan

#### "Cannot find module"
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

#### Contract not verified on BSCScan
- Wait a few minutes and try manual verification
- Or continue - unverified contracts still work

#### Web app shows "0x000..." addresses
- Update `.env` with correct contract addresses
- Restart the development server

---

## Next Steps

After deployment:

1. **Distribute CPT tokens** to test users
2. **Register as a host** through the web app
3. **Create a test job** to verify the full flow
4. **Monitor contract events** on BSCScan

---

## Support

- Check the main [README.md](https://github.com/Toaster496/Inavative-solutions/blob/main/README.md) for detailed documentation
- Review troubleshooting section in README
- Check contract events on [BSCScan](https://testnet.bscscan.com/)
