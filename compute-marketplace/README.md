# ComputeMarket - Decentralized GPU/Compute Hosting Platform

A fully functional decentralized marketplace for GPU compute resources, similar to Vast.ai but built on blockchain with its own cryptocurrency and 25% protocol fee.

## Architecture

### Components

1. **Smart Contracts** (`/contracts`)
   - `ComputeCoin.sol` - ERC-20 token (CPT) with built-in 25% treasury fee
   - `ComputeMarketplace.sol` - Job management, escrow, host registration

2. **Web Application** (`/web-app`)
   - React + TypeScript + Vite
   - Wallet connection (MetaMask)
   - Job marketplace interface
   - Host registration dashboard

3. **Desktop Client** (`/desktop-client`)
   - Electron-based host daemon
   - libp2p for peer-to-peer communication
   - Docker integration for job execution
   - GPU detection and monitoring
   - System tray background operation

## Features

✅ **Cryptocurrency**: CPT token with automatic 25% protocol fee on all transfers
✅ **Smart Contract Escrow**: Secure job payments held until completion
✅ **Host Staking**: 100 CPT minimum stake required to become a host
✅ **Reputation System**: Hosts earn reputation for completed jobs
✅ **P2P Networking**: libp2p for decentralized node discovery
✅ **Docker Isolation**: Containerized job execution with GPU passthrough
✅ **Permissionless**: No KYC, anonymous wallet-based authentication
✅ **Cross-Platform**: Desktop client for Windows, macOS, Linux

## Quick Start

### Prerequisites
- Node.js 18+
- MetaMask or compatible wallet
- Docker (for desktop host)
- NVIDIA GPU + drivers (for GPU hosting)

### 1. Deploy Smart Contracts

```bash
cd contracts
npm install

# Set environment variables
export PRIVATE_KEY="your_wallet_private_key"
export BSC_TESTNET_URL="https://data-seed-preload1-s1.bscnode.com/"

# Deploy to BSC Testnet
npm run deploy:testnet
```

Save the deployed contract addresses!

### 2. Configure Web App

Create `/web-app/.env`:
```
VITE_COMPUTE_COIN_ADDRESS=0x...
VITE_MARKETPLACE_ADDRESS=0x...
```

Run web app:
```bash
cd web-app
npm install
npm run dev
```

Access at `http://localhost:3000`

### 3. Configure Desktop Host

Create `/desktop-client/.env`:
```
HOST_WALLET_PRIVATE_KEY=your_private_key
MARKETPLACE_ADDRESS=0x...
COMPUTE_COIN_ADDRESS=0x...
RPC_URL=https://data-seed-preload1-s1.bscnode.com/
GPU_ID=0
MAX_PRICE_PER_HOUR=10
AUTO_ACCEPT_JOBS=false
```

Run desktop client:
```bash
cd desktop-client
npm install
npm start
```

## Token Economics

- **Total Supply**: 1,000,000,000 CPT
- **Protocol Fee**: 25% on all transfers (automatic in token contract)
- **Host Stake**: 100 CPT minimum
- **Treasury**: Accumulates 25% fees for protocol development

## Smart Contract Functions

### ComputeCoin (CPT)
- `transfer(address, uint256)` - Transfer tokens (25% fee auto-deducted)
- `approve(address, uint256)` - Approve spending
- `balanceOf(address)` - Check balance

### ComputeMarketplace
- `registerHost(string nodeInfo)` - Register as compute provider
- `createJob(string jobSpec, uint256 price)` - Post compute job
- `acceptJob(uint256 jobId)` - Accept a job
- `completeJob(uint256 jobId, bytes32 resultHash)` - Submit results
- `getJob(uint256 jobId)` - Get job details
- `getHostInfo(address)` - Get host reputation/stake

## Job Flow

1. **Client** creates job with specification and price
2. **Tokens locked** in smart contract escrow
3. **Host** accepts job (must be registered with stake)
4. **Docker container** spawned with job specification
5. **Computation runs** with GPU access
6. **Host submits** result hash
7. **Payment released** to host (minus 25% fee already taken)
8. **Reputation updated** for host

## Security Features

- Smart contract escrow prevents non-payment
- Host staking deters malicious behavior
- Docker isolation protects host system
- libp2p encryption for P2P communications
- Permissionless but accountable via blockchain

## Tech Stack

**Blockchain**: Solidity, Hardhat, BSC Testnet
**Web**: React, TypeScript, Vite, ethers.js, Zustand
**Desktop**: Electron, Node.js, libp2p, dockerode
**Contracts**: Solidity 0.8.20

## Network Configuration

Currently configured for **BSC Testnet** (Chain ID: 97)
- RPC: `https://data-seed-preload1-s1.bscnode.com/`
- Explorer: `https://testnet.bscscan.com/`

To use mainnet, update:
- `contracts/hardhat.config.js`
- `web-app/src/lib/constants.ts`
- Desktop client `.env`

## License

MIT - Permissionless and open source

## Support

For issues, check:
- Smart contract events on BSCScan
- Desktop client logs in-app
- Browser console for web app errors
