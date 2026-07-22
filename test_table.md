# ComputeMarket - Test Cases

| Test # | Test Description | Test Steps | Test Data | Expected Result | Actual Result | Pass / Fail |
|--------|------------------|------------|-----------|-----------------|---------------|-------------|
| 1 | Deploy ComputeCoin smart contract to BSC Testnet | 1. Navigate to contracts directory<br>2. Install dependencies<br>3. Set PRIVATE_KEY and BSC_TESTNET_URL environment variables<br>4. Run npm run deploy:testnet | PRIVATE_KEY, BSC_TESTNET_URL | Contract deploys successfully and address is returned | | |
| 2 | Deploy ComputeMarketplace smart contract to BSC Testnet | 1. Navigate to contracts directory<br>2. Ensure ComputeCoin is deployed<br>3. Run deployment script with ComputeCoin address | ComputeCoin contract address | Marketplace contract deploys successfully and address is returned | | |
| 3 | Verify CPT token transfer with 25% protocol fee | 1. Connect wallet with CPT tokens<br>2. Transfer 100 CPT to another address<br>3. Check recipient balance and treasury balance | Sender: Wallet A, Recipient: Wallet B, Amount: 100 CPT | Recipient receives 75 CPT, 25 CPT goes to treasury | | |
| 4 | Register as compute host | 1. Connect wallet to web app<br>2. Approve 100 CPT stake<br>3. Call registerHost with node info | Node Info: GPU model, specs | Host is registered with 100 CPT staked | | |
| 5 | Create compute job from client | 1. Connect wallet to web app<br>2. Fill job specification form<br>3. Set price in CPT<br>4. Submit job | Job Spec: Docker image, GPU requirements, Price: 10 CPT | Job is created and tokens are locked in escrow | | |
| 6 | Host accepts a compute job | 1. Desktop client detects available job<br>2. Host calls acceptJob with job ID | Job ID: 1 | Job status changes to "in progress" | | |
| 7 | Docker container spawns for job execution | 1. Host accepts job<br>2. Desktop client pulls Docker image<br>3. Container starts with GPU passthrough | Docker Image: tensorflow/tensorflow:latest-gpu | Container runs with GPU access | | |
| 8 | Host completes job and submits result | 1. Computation finishes<br>2. Desktop client generates result hash<br>3. Call completeJob with result hash | Result Hash: 0x... | Job status changes to "completed" | | |
| 9 | Payment released to host after job completion | 1. Job marked as completed<br>2. Smart contract releases escrowed funds | Job ID: 1, Escrow Amount: 10 CPT | Host receives payment (minus 25% fee already taken) | | |
| 10 | Host reputation updated after job completion | 1. Job completed successfully<br>2. Query host info | Host Address: 0x... | Host reputation score increases | | |
| 11 | Desktop client detects NVIDIA GPU | 1. Start desktop client<br>2. Check GPU detection logs | System with NVIDIA GPU | GPU is detected and listed in available resources | | |
| 12 | libp2p peer discovery between nodes | 1. Start multiple desktop clients<br>2. Check peer list | 2+ running hosts | Nodes discover each other via libp2p | | |
| 13 | Web app connects to MetaMask wallet | 1. Open web app<br>2. Click "Connect Wallet"<br>3. Approve in MetaMask | MetaMask installed | Wallet connects and address is displayed | | |
| 14 | Host stake requirement enforcement | 1. Attempt to register host with < 100 CPT<br>2. Try to approve stake | Stake Amount: 50 CPT | Transaction reverts with insufficient stake error | | |
| 15 | Verify treasury accumulates 25% fees | 1. Execute multiple token transfers<br>2. Check treasury balance | Multiple transfers totaling 1000 CPT | Treasury holds 250 CPT (25% of total) | | |
