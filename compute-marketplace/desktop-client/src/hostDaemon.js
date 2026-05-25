const { createLibp2p } = require('libp2p');
const { tcp } = require('@libp2p/tcp');
const { mplex } = require('@libp2p/mplex');
const { noise } = require('@libp2p/noise');
const { ethers } = require('ethers');
const Docker = require('dockerode');
const { v4: uuidv4 } = require('uuid');
const Database = require('better-sqlite3');
const os = require('os');
const { execSync } = require('child_process');

// Contract ABIs (same as web app)
const COMPUTE_COIN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address,uint256) returns (bool)",
  "function approve(address,uint256) returns (bool)"
];

const MARKETPLACE_ABI = [
  "function MIN_HOST_STAKE() view returns (uint256)",
  "function jobs(uint256) view returns (uint256 id, address client, address host, string jobSpec, uint256 price, uint256 stake, uint8 status, uint256 createdAt, uint256 completedAt, bytes32 resultHash)",
  "function hosts(address) view returns (bool registered, uint256 stake, uint256 reputation, uint256 completedJobs, string nodeInfo)",
  "function acceptJob(uint256 jobId)",
  "function completeJob(uint256 jobId, bytes32 resultHash)",
  "function registerHost(string memory nodeInfo)"
];

class HostDaemon {
  constructor(config) {
    this.config = config;
    this.node = null;
    this.isRunningFlag = false;
    this.activeJob = null;
    this.earnings = 0n;
    this.logs = [];
    this.db = new Database(':memory:');
    this.docker = new Docker();
    this.provider = null;
    this.wallet = null;
    this.marketplaceContract = null;
    this.coinContract = null;
    
    this.initDatabase();
  }

  initDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY,
        jobId TEXT UNIQUE,
        status TEXT,
        spec TEXT,
        price TEXT,
        createdAt INTEGER,
        completedAt INTEGER,
        resultHash TEXT
      )
    `);
    
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS earnings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount TEXT,
        timestamp INTEGER,
        jobId TEXT
      )
    `);
  }

  log(message, level = 'info') {
    const entry = {
      timestamp: Date.now(),
      level,
      message
    };
    this.logs.push(entry);
    console.log(`[${level.toUpperCase()}] ${message}`);
    
    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs.shift();
    }
  }

  getGpuInfo() {
    try {
      // Try nvidia-smi for GPU info
      const gpuOutput = execSync('nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore']
      });
      
      const gpus = gpuOutput.trim().split('\n').map(line => {
        const [name, memory, driver] = line.split(', ');
        return { name, memory: `${Math.round(parseInt(memory) / 1024)}GB`, driver };
      });
      
      return {
        gpus,
        cpu: os.cpus()[0].model,
        ram: `${Math.round(os.totalmem() / (1024 ** 3))}GB`,
        platform: os.platform()
      };
    } catch (error) {
      return {
        gpus: [],
        cpu: os.cpus()[0].model,
        ram: `${Math.round(os.totalmem() / (1024 ** 3))}GB`,
        platform: os.platform(),
        note: 'No NVIDIA GPU detected or nvidia-smi not available'
      };
    }
  }

  async initializeBlockchain() {
    try {
      this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
      this.wallet = new ethers.Wallet(this.config.walletPrivateKey, this.provider);
      
      this.coinContract = new ethers.Contract(
        this.config.coinAddress,
        COMPUTE_COIN_ABI,
        this.wallet
      );
      
      this.marketplaceContract = new ethers.Contract(
        this.config.marketplaceAddress,
        MARKETPLACE_ABI,
        this.wallet
      );
      
      this.log('Blockchain connection initialized');
      return true;
    } catch (error) {
      this.log(`Blockchain initialization failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async start() {
    if (this.isRunningFlag) {
      this.log('Daemon already running');
      return;
    }

    try {
      this.log('Starting ComputeMarket Host Daemon...');
      
      // Initialize blockchain connection
      await this.initializeBlockchain();
      
      // Check if registered as host
      const hostInfo = await this.marketplaceContract.hosts(this.wallet.address);
      if (!hostInfo.registered) {
        this.log('Not registered as host. Please register via web app first.', 'warning');
        // Auto-register if desired
        await this.registerAsHost();
      }
      
      // Initialize libp2p node for peer-to-peer communication
      this.node = await createLibp2p({
        addresses: {
          listen: ['/ip4/0.0.0.0/tcp/0']
        },
        transports: [tcp()],
        streamMuxers: [mplex()],
        connectionEncryption: [noise()]
      });
      
      this.log(`Libp2p node started with ID: ${this.node.peerId.toString()}`);
      
      // Set up job monitoring
      this.startJobMonitoring();
      
      this.isRunningFlag = true;
      this.log('Host daemon started successfully');
      
    } catch (error) {
      this.log(`Failed to start daemon: ${error.message}`, 'error');
      throw error;
    }
  }

  async stop() {
    if (!this.isRunningFlag) {
      return;
    }

    try {
      this.log('Stopping host daemon...');
      
      // Stop any active job
      if (this.activeJob) {
        await this.stopActiveJob();
      }
      
      // Stop libp2p node
      if (this.node) {
        await this.node.stop();
        this.node = null;
      }
      
      this.isRunningFlag = false;
      this.log('Host daemon stopped');
      
    } catch (error) {
      this.log(`Error stopping daemon: ${error.message}`, 'error');
    }
  }

  async registerAsHost() {
    try {
      const peerId = this.node ? this.node.peerId.toString() : 'pending';
      
      // Get minimum stake
      const minStake = await this.marketplaceContract.MIN_HOST_STAKE();
      
      // Approve token transfer
      const approveTx = await this.coinContract.approve(
        this.config.marketplaceAddress,
        minStake
      );
      await approveTx.wait();
      this.log('Token approval granted');
      
      // Register as host
      const registerTx = await this.marketplaceContract.registerHost(peerId);
      await registerTx.wait();
      
      this.log(`Registered as host with ${minStake.toString()} CPT staked`);
      
    } catch (error) {
      this.log(`Registration failed: ${error.message}`, 'error');
      throw error;
    }
  }

  startJobMonitoring() {
    // Poll for new jobs every 30 seconds
    setInterval(async () => {
      if (!this.isRunningFlag || !this.activeJob) {
        await this.checkForNewJobs();
      }
    }, 30000);
    
    this.log('Started job monitoring (30s interval)');
  }

  async checkForNewJobs() {
    try {
      const jobCounter = await this.marketplaceContract.jobCounter();
      
      // Check last 10 jobs for available ones
      const startIndex = jobCounter > 10n ? jobCounter - 10n : 1n;
      
      for (let i = startIndex; i <= jobCounter; i++) {
        const job = await this.marketplaceContract.jobs(i);
        
        if (Number(job.status) === 0) { // Status.Created
          const priceInCpt = Number(ethers.formatEther(job.price));
          
          if (priceInCpt <= Number(this.config.maxPricePerHour)) {
            this.log(`Found available job #${i}: ${priceInCpt} CPT`);
            
            if (this.config.autoAcceptJobs) {
              await this.acceptJob(Number(i));
            }
          }
        }
      }
    } catch (error) {
      this.log(`Error checking jobs: ${error.message}`, 'error');
    }
  }

  async acceptJob(jobId) {
    try {
      this.log(`Accepting job #${jobId}...`);
      
      const tx = await this.marketplaceContract.acceptJob(jobId);
      await tx.wait();
      
      this.log(`Job #${jobId} accepted`);
      
      // Fetch job details and start execution
      const job = await this.marketplaceContract.jobs(jobId);
      await this.executeJob(jobId, job.jobSpec);
      
    } catch (error) {
      this.log(`Failed to accept job: ${error.message}`, 'error');
    }
  }

  async executeJob(jobId, jobSpec) {
    try {
      this.log(`Executing job #${jobId}...`);
      this.activeJob = { jobId, spec: jobSpec, startTime: Date.now() };
      
      // Parse job spec (could be IPFS hash, docker image, or custom spec)
      let containerConfig;
      
      try {
        containerConfig = JSON.parse(jobSpec);
      } catch {
        // Default configuration for LLM inference
        containerConfig = {
          Image: 'vllm/vllm-openai:latest',
          Env: [
            `MODEL_NAME=${jobSpec}`,
            'GPU_MEMORY_UTILIZATION=0.9'
          ],
          HostConfig: {
            Runtime: 'nvidia',
            DeviceRequests: [
              {
                Driver: 'nvidia',
                Count: -1, // All GPUs
                Capabilities: [['gpu']]
              }
            ]
          },
          ExposedPorts: { '8000/tcp': {} },
          HostConfig: {
            PortBindings: { '8000/tcp': [{ HostPort: '8000' }] }
          }
        };
      }
      
      // Pull and run Docker container
      const container = await this.docker.createContainer(containerConfig);
      await container.start();
      
      this.log(`Container ${container.id} started for job #${jobId}`);
      
      // Monitor container
      const checkInterval = setInterval(async () => {
        try {
          const info = await container.inspect();
          
          if (!info.State.Running) {
            clearInterval(checkInterval);
            await this.completeJob(jobId, container.id);
          }
        } catch (error) {
          clearInterval(checkInterval);
          this.log(`Container error: ${error.message}`, 'error');
        }
      }, 10000);
      
    } catch (error) {
      this.log(`Job execution failed: ${error.message}`, 'error');
      this.activeJob = null;
    }
  }

  async completeJob(jobId, resultHash) {
    try {
      this.log(`Completing job #${jobId}...`);
      
      // Generate result hash (in production, this would be actual computation proof)
      const hash = resultHash || `0x${Buffer.from(uuidv4()).toString('hex')}`;
      
      const tx = await this.marketplaceContract.completeJob(jobId, hash);
      await tx.wait();
      
      this.log(`Job #${jobId} completed. Result hash: ${hash}`);
      
      // Record earnings
      this.earnings += BigInt(jobId); // Simplified - would use actual job price
      
      this.activeJob = null;
      
    } catch (error) {
      this.log(`Failed to complete job: ${error.message}`, 'error');
    }
  }

  async stopActiveJob() {
    if (this.activeJob) {
      try {
        const containers = await this.docker.listContainers();
        const jobContainer = containers.find(c => 
          c.Labels && c.Labels.jobId === String(this.activeJob.jobId)
        );
        
        if (jobContainer) {
          const container = this.docker.getContainer(jobContainer.Id);
          await container.stop();
          await container.remove();
        }
      } catch (error) {
        this.log(`Error stopping active job: ${error.message}`, 'error');
      }
      
      this.activeJob = null;
    }
  }

  async withdrawEarnings() {
    try {
      const balance = await this.coinContract.balanceOf(this.wallet.address);
      
      if (balance === 0n) {
        return { success: false, message: 'No earnings to withdraw' };
      }
      
      // In production, implement proper withdrawal logic
      return {
        success: true,
        amount: ethers.formatEther(balance),
        address: this.wallet.address
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  isRunning() {
    return this.isRunningFlag;
  }

  getPeerId() {
    return this.node ? this.node.peerId.toString() : null;
  }

  getActiveJob() {
    return this.activeJob;
  }

  getEarnings() {
    return this.earnings;
  }

  getLogs() {
    return this.logs.slice(-100); // Return last 100 logs
  }

  async updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.log('Configuration updated');
  }
}

module.exports = { HostDaemon };
