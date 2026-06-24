# ComputeMarket - Decentralized GPU/Compute Hosting Platform

A fully functional decentralized marketplace for GPU compute resources, similar to Vast.ai and Clore.ai but built on blockchain with its own cryptocurrency (CPT) and 25% protocol fee.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![BSC Testnet](https://img.shields.io/badge/Network-BSC%20Testnet%20(97)-gold)](https://testnet.bscscan.com/)


<img width="1200" height="600" alt="image" src="https://github.com/user-attachments/assets/1be7cbe7-a5cf-47cb-a4f2-2d155ab2ffdf" />



---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start Guide](#quick-start-guide)
- [Detailed Setup](#detailed-setup)
  - [1. Deploy Smart Contracts](#1-deploy-smart-contracts)
  - [2. Configure & Run Web App](#2-configure--run-web-app)
  - [3. Configure & Run Desktop Client](#3-configure--run-desktop-client)
- [Token Economics](#token-economics)
- [Smart Contract Reference](#smart-contract-reference)
- [Job Flow](#job-flow)
- [Configuration Reference](#configuration-reference)
- [Troubleshooting](#troubleshooting)
- [Security Features](#security-features)
- [Tech Stack](#tech-stack)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

ComputeMarket enables permissionless buying and selling of GPU/CPU compute power using blockchain technology. Key features:

- **No KYC Required** - Connect with any EVM-compatible wallet
- **Automatic Protocol Fee** - 25% fee on all token transfers funds treasury
- **Secure Escrow** - Smart contracts hold payments until job completion
- **Cross-Platform** - Desktop client works on Windows, macOS, and Linux
- **Docker Isolation** - Jobs run in secure containers with GPU passthrough

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ComputeMarket Ecosystem                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │  Web App     │◄───────►│   Blockchain │                  │
│  │  (React)     │         │  (BSC)       │                  │
│  └──────────────┘         └──────────────┘                  │
│         ▲                        ▲                          │
│         │                        │                          │
│         ▼                        ▼                          │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │   Desktop    │◄───────►│ Smart        │                  │
│  │   Client     │  P2P    │ Contracts    │                  │
│  │  (Electron)  │         │              │                  │
│  └──────────────┘         └──────────────┘                  │
│                              │                               │
│                              ▼                               │
│                       ┌──────────────┐                       │
│                       │   Docker     │                       │
│                       │  Containers  │                       │
│                       └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

### Components

| Component | Location | Technology | Purpose |
|-----------|----------|------------|---------|
| **Smart Contracts** | `/contracts` | Solidity, Hardhat | Token (CPT) & Marketplace logic |
| **Web Application** | `/web-app` | React, TypeScript, Vite | User interface for clients & hosts |
| **Desktop Client** | `/desktop-client` | Electron, Node.js | Host daemon for running jobs |
| **Deployment Scripts** | `/scripts` | JavaScript | Automated contract deployment |

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

| Software | Version | Download |
|----------|---------|----------|
| **Node.js** | 18.x or higher | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.x or higher | (Included with Node.js) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |
| **MetaMask** | Latest | [metamask.io](https://metamask.io/) |

### For Desktop Host (Optional)

| Software | Version | Notes |
|----------|---------|-------|
| **Docker** | 20.x or higher | Required for running compute jobs |
| **NVIDIA Drivers** | Latest | Only needed for GPU hosting |
| **NVIDIA Container Toolkit** | Latest | GPU passthrough for Docker |

### Verify Installation

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version (should be 9+)
npm --version

# Check Docker (if hosting)
docker --version

# Check NVIDIA GPU (if GPU hosting)
nvidia-smi
```

---

## Quick Start Guide

### Option A: Full Deployment (All Components)

```bash
# Clone the repository
git clone https://github.com/Toaster496/Inavative-solutions
cd ComputeMarket

# 1. Deploy contracts (requires BNB testnet tokens)
cd contracts
npm install
echo "PRIVATE_KEY=your_wallet_private_key" > .env
npm run deploy:testnet
# Save the contract addresses from output!

# 2. Setup web app
cd ../web-app
npm install
cat > .env << EOF
VITE_COMPUTE_COIN_ADDRESS=0x...  # From deployment output
VITE_MARKETPLACE_ADDRESS=0x...   # From deployment output
EOF
npm run dev
# Open http://localhost:5173

# 3. Setup desktop host (optional - for providing compute)
cd ../desktop-client
npm install
cat > .env << EOF
HOST_WALLET_PRIVATE_KEY=your_private_key
MARKETPLACE_ADDRESS=0x...
COMPUTE_COIN_ADDRESS=0x...
RPC_URL=https://data-seed-preload1-s1.bscnode.com/
GPU_ID=0
MAX_PRICE_PER_HOUR=10
AUTO_ACCEPT_JOBS=false
EOF
npm start
```

### Option B: Development Mode (Local Blockchain)

For testing without spending real testnet tokens:

```bash
# Terminal 1: Start local blockchain
cd contracts
npm install
npm run node
# Keep this running!

# Terminal 2: Deploy to local network
cd contracts
npx hardhat run scripts/deploy.js --network localhost
# Save addresses and update web-app/.env

# Terminal 3: Run web app
cd web-app
npm install
# Update .env with localhost addresses
npm run dev
```

---

## Detailed Setup

### 1. Deploy Smart Contracts

#### Step 1.1: Install Dependencies

```bash
cd contracts
npm install
```

#### Step 1.2: Configure Wallet

Create a `.env` file in the `contracts` directory:

```bash
# Generate a new wallet or use existing one
# NEVER share your private key or commit it to git!
PRIVATE_KEY="your_ethereum_private_key_here"
BSC_TESTNET_URL="https://data-seed-preload1-s1.bscnode.com/"
```

> [!WARNING]
> The `.env` file is in `.gitignore`, but always double-check before committing!

#### Step 1.3: Get Testnet BNB

You'll need BNB on BSC Testnet for gas fees:

1. Add BSC Testnet to MetaMask:
   - Network Name: BSC Testnet
   - RPC URL: `https://data-seed-preload1-s1.bscnode.com/`
   - Chain ID: `97`
   - Symbol: `tBNB`
   - Block Explorer: `https://testnet.bscscan.com/`

2. Request test tokens from a faucet:
   - [BSC Faucet](https://testnet.binance.org/faucet-smart)
   - [QuickNode Faucet](https://faucets.chain.link/bsc-testnet)

#### Step 1.4: Deploy Contracts

```bash
# Compile contracts
npm run compile

# Deploy to BSC Testnet
npm run deploy:testnet
```

**Expected Output:**
```
Deploying ComputeCoin and ComputeMarketplace to BSC Testnet...
ComputeCoin deployed to: 0x1234567890abcdef1234567890abcdef12345678
ComputeMarketplace deployed to: 0xabcdef1234567890abcdef1234567890abcdef12
Waiting for block confirmations...
ComputeCoin verified on BSCScan
ComputeMarketplace verified on BSCScan

=== Deployment Summary ===
ComputeCoin (CPT): 0x1234567890abcdef1234567890abcdef12345678
ComputeMarketplace: 0xabcdef1234567890abcdef1234567890abcdef12

Remember to set these addresses in your web and desktop clients!
```

**Save these addresses!** You'll need them for the next steps.

---

### 2. Configure & Run Web App

#### Step 2.1: Install Dependencies

```bash
cd web-app
npm install
```

#### Step 2.2: Create Environment File

Create `.env` in the `web-app` directory:

```bash
# Contract addresses from deployment
VITE_COMPUTE_COIN_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
VITE_MARKETPLACE_ADDRESS=0xabcdef1234567890abcdef1234567890abcdef12
```

#### Step 2.3: Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

#### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (hot reload enabled) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |

---

### 3. Configure & Run Desktop Client

The desktop client allows users to provide compute resources and earn CPT tokens.

#### Step 3.1: Install Dependencies

```bash
cd desktop-client
npm install
```

#### Step 3.2: Create Environment File

Create `.env` in the `desktop-client` directory:

```bash
# Wallet configuration
HOST_WALLET_PRIVATE_KEY=your_private_key_here

# Contract addresses (same as web app)
MARKETPLACE_ADDRESS=0xabcdef1234567890abcdef1234567890abcdef12
COMPUTE_COIN_ADDRESS=0x1234567890abcdef1234567890abcdef12345678

# Network configuration
RPC_URL=https://data-seed-preload1-s1.bscnode.com/

# Hardware configuration
GPU_ID=0                    # GPU device ID (0 for first GPU)
MAX_PRICE_PER_HOUR=10       # Maximum price in CPT per hour
AUTO_ACCEPT_JOBS=false      # Manually approve jobs (true for auto-accept)

# Optional: CPU-only mode (set to true if no GPU)
CPU_ONLY=false
CPU_CORES=8                 # Number of CPU cores to offer
RAM_GB=16                   # Amount of RAM in GB to offer
```

#### Step 3.3: Start Desktop Client

```bash
npm start
```

#### Building for Production

```bash
# Build for current platform
npm run build

# Build for specific platforms
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

Built packages will be in the `dist/` directory.

---

## Token Economics

### CPT Token Details

| Parameter | Value |
|-----------|-------|
| **Token Name** | ComputeCoin |
| **Symbol** | CPT |
| **Total Supply** | 1,000,000,000 CPT |
| **Decimals** | 18 |
| **Protocol Fee** | 25% (automatic on all transfers) |
| **Host Minimum Stake** | 100 CPT |

### Fee Distribution

```
┌────────────────────────────────────────┐
│         Any CPT Transfer               │
├────────────────────────────────────────┤
│  Recipient: 75% of transfer amount     │
│  Treasury:  25% of transfer amount     │
└────────────────────────────────────────┘
```

The 25% fee is automatically deducted by the smart contract and sent to the protocol treasury. This funds ongoing development and operations.

### Getting CPT Tokens

For testing on testnet:

1. Deploy the ComputeCoin contract (you become the token owner)
2. Use the contract's `transfer` function to distribute tokens
3. Or interact with the web app to request test tokens

---

## Smart Contract Reference

### ComputeCoin (CPT Token)

**File:** `contracts/ComputeCoin.sol`

| Function | Parameters | Description |
|----------|------------|-------------|
| `transfer` | `(address recipient, uint256 amount)` | Transfer tokens (25% fee auto-deducted) |
| `approve` | `(address spender, uint256 amount)` | Approve another address to spend tokens |
| `balanceOf` | `(address account)` | Get token balance of an address |
| `allowance` | `(address owner, address spender)` | Get approved spending allowance |
| `transferFrom` | `(address sender, address recipient, uint256 amount)` | Transfer tokens on behalf of another address |

### ComputeMarketplace

**File:** `contracts/ComputeMarketplace.sol`

#### Host Functions

| Function | Parameters | Description |
|----------|------------|-------------|
| `registerHost` | `(string nodeInfo, string[] gpuIds, uint256 gpuCount, uint256 cpuCores, uint256 ramGB)` | Register as GPU host |
| `registerCpuHost` | `(string nodeInfo, uint256 cpuCores, uint256 ramGB)` | Register as CPU-only host |
| `submitHeartbeat` | `()` | Submit heartbeat to show availability |
| `withdrawStake` | `(uint256 amount)` | Withdraw staked tokens |

#### Job Functions

| Function | Parameters | Description |
|----------|------------|-------------|
| `createJob` | `(string jobSpec, uint256 price, uint8 resourceType, uint256 gpuCount, uint256 contextLength)` | Post a compute job |
| `createBatchJob` | `(string[] jobSpecs, uint256[] prices, uint8 resourceType, uint256 gpuCount)` | Post multiple jobs |
| `acceptJob` | `(uint256 jobId)` | Accept a pending job |
| `completeJob` | `(uint256 jobId, bytes32 resultHash)` | Submit job results |
| `getJob` | `(uint256 jobId)` | Get job details |

#### Dispute Functions

| Function | Parameters | Description |
|----------|------------|-------------|
| `submitChallenge` | `(uint256 jobId, bytes32 submittedHash, bytes32 verifiedHash)` | Challenge job results |
| `resolveChallenge` | `(uint256 challengeId, bool fraudProven)` | Resolve a challenge |

---

## Job Flow

```
┌─────────┐     ┌─────────────┐     ┌─────────┐     ┌──────────┐
│ Client  │     │ Smart       │     │ Host    │     │ Docker   │
│         │     │ Contract    │     │ Daemon  │     │ Container│
└────┬────┘     └──────┬──────┘     └────┬────┘     └────┬─────┘
     │                 │                  │               │
     │ 1. Create Job   │                  │               │
     │────────────────>│                  │               │
     │                 │                  │               │
     │ 2. Lock Payment │                  │               │
     │    (Escrow)     │                  │               │
     │                 │                  │               │
     │                 │ 3. Accept Job    │               │
     │                 │<─────────────────│               │
     │                 │                  │               │
     │                 │ 4. Spawn         │               │
     │                 │                  │──────────────>│
     │                 │                  │               │
     │                 │ 5. Run Compute   │               │
     │                 │                  │<──────────────│
     │                 │                  │               │
     │                 │ 6. Submit Result │               │
     │                 │<─────────────────│               │
     │                 │                  │               │
     │ 7. Release      │                  │               │
     │    Payment      │                  │               │
     │<────────────────│                  │               │
     │                 │                  │               │
     │                 │ 8. Update        │               │
     │                 │    Reputation    │               │
     │                 │─────────────────>│               │
     │                 │                  │               │
```

### Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 0 | Open | Job posted, waiting for host |
| 1 | Accepted | Host accepted, preparing to run |
| 2 | Running | Computation in progress |
| 3 | Completed | Results submitted |
| 4 | Disputed | Challenge initiated |
| 5 | Cancelled | Job cancelled by client |
| 6 | Challenged | Under dispute resolution |

---

## Configuration Reference

### Web App Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_COMPUTE_COIN_ADDRESS` | Yes | Deployed CPT token address | `0x1234...` |
| `VITE_MARKETPLACE_ADDRESS` | Yes | Deployed marketplace address | `0xabcd...` |

### Desktop Client Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `HOST_WALLET_PRIVATE_KEY` | Yes | - | Host wallet private key |
| `MARKETPLACE_ADDRESS` | Yes | - | Marketplace contract address |
| `COMPUTE_COIN_ADDRESS` | Yes | - | CPT token contract address |
| `RPC_URL` | Yes | - | BSC RPC endpoint |
| `GPU_ID` | No | `0` | GPU device ID |
| `MAX_PRICE_PER_HOUR` | No | `10` | Max price in CPT/hour |
| `AUTO_ACCEPT_JOBS` | No | `false` | Auto-accept incoming jobs |
| `CPU_ONLY` | No | `false` | Enable CPU-only mode |
| `CPU_CORES` | No | `4` | CPU cores to offer |
| `RAM_GB` | No | `8` | RAM in GB to offer |

### Contract Deployment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PRIVATE_KEY` | Yes | Deployer wallet private key |
| `BSC_TESTNET_URL` | No | BSC testnet RPC (default provided) |

---

## Troubleshooting

### Common Issues

#### Contract Deployment Fails

**Error:** `insufficient funds for gas * price + value`

**Solution:** 
- Ensure your wallet has enough tBNB for gas fees
- Check balance on [BSC Testnet Explorer](https://testnet.bscscan.com/)
- Request more tokens from faucets

#### Web App Can't Connect to Wallet

**Symptoms:** MetaMask doesn't appear, connection fails

**Solutions:**
1. Ensure MetaMask is installed and unlocked
2. Switch to BSC Testnet network in MetaMask
3. Clear browser cache and reload
4. Check browser console for errors

#### Desktop Client Won't Start

**Error:** `Cannot find module`

**Solution:**
```bash
cd desktop-client
rm -rf node_modules package-lock.json
npm install
npm start
```

#### Docker GPU Passthrough Issues

**Symptoms:** Jobs can't access GPU

**Solutions:**
1. Install NVIDIA Container Toolkit:
   ```bash
   distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
   curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit.gpg
   curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit.gpg] https://#g' | sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list
   sudo apt-get update
   sudo apt-get install -y nvidia-container-toolkit
   sudo systemctl restart docker
   ```

2. Test GPU access:
   ```bash
   docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi
   ```

#### Transaction Reverted

**Error:** `execution reverted`

**Possible Causes:**
- Insufficient token balance
- Haven't staked minimum required (100 CPT for hosts)
- Contract not approved to spend tokens

**Solution:** Check error details on BSCScan and ensure you meet requirements.

---

## Security Features

| Feature | Description |
|---------|-------------|
| **Smart Contract Escrow** | Payments held securely until job completion |
| **Host Staking** | 100 CPT minimum stake deters malicious behavior |
| **Docker Isolation** | Jobs run in isolated containers, protecting host system |
| **libp2p Encryption** | All P2P communications are encrypted |
| **Challenge Period** | Time window for disputing incorrect results |
| **Reputation System** | Hosts build reputation through completed jobs |
| **Non-Custodial** | Users maintain control of their funds |

---

## Tech Stack

### Blockchain
- **Solidity** 0.8.20 - Smart contract language
- **Hardhat** - Ethereum development environment
- **BSC Testnet** - Binance Smart Chain test network
- **OpenZeppelin** - Secure contract libraries

### Web Application
- **React** 18 - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **ethers.js** 6 - Ethereum library
- **wagmi** - React hooks for Ethereum
- **Zustand** - State management
- **React Router** - Navigation

### Desktop Client
- **Electron** 28 - Cross-platform desktop framework
- **Node.js** - Runtime environment
- **libp2p** - Peer-to-peer networking
- **dockerode** - Docker API client
- **better-sqlite3** - Local database

---

## Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## Network Configuration

### Current Network: BSC Testnet

| Parameter | Value |
|-----------|-------|
| **Chain ID** | 97 |
| **RPC URL** | `https://data-seed-preload1-s1.bscnode.com/` |
| **Explorer** | `https://testnet.bscscan.com/` |
| **Symbol** | tBNB |

### Switching to Mainnet

To deploy on BSC Mainnet:

1. Update `contracts/hardhat.config.js`:
   ```javascript
   bscMainnet: {
     url: "https://bsc-dataseed.binance.org/",
     accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
     chainId: 56
   }
   ```

2. Update `web-app/src/lib/constants.ts`:
   ```typescript
   chainId: 56,
   rpcUrl: 'https://bsc-dataseed.binance.org/'
   ```

3. Update desktop client `.env`:
   ```
   RPC_URL=https://bsc-dataseed.binance.org/
   ```

---

## License

This project is licensed under the **MIT License** - see the LICENSE file for details.

Permissionless and open source. Feel free to use, modify, and distribute.

---

## Support & Resources

- **Documentation**: This README and inline code comments
- **Contract Verification**: View verified contracts on [BSCScan](https://testnet.bscscan.com/)
- **Issue Tracker**: GitHub Issues for bugs and feature requests
- **Community**: Join our discussions for help and updates

### Useful Links

- [BSC Testnet Faucet](https://testnet.binance.org/faucet-smart)
- [BSC Testnet Explorer](https://testnet.bscscan.com/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Electron Documentation](https://www.electronjs.org/docs)

---

<div align="center">

**Built with ❤️ for decentralized computing**

[Report Bug](../../issues) · [Request Feature](../../issues)

<img width="1832" height="491" alt="image" src="https://github.com/user-attachments/assets/5ddf86b6-895b-4973-8198-2818f5ee65e1" />


</div>
