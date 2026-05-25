import { create } from 'zustand';
import { ethers } from 'ethers';
import { CONTRACTS, COMPUTE_COIN_ABI, MARKETPLACE_ABI, JOB_STATUS_LABELS } from '../lib/constants';

interface Job {
  id: number;
  client: string;
  host: string;
  jobSpec: string;
  price: bigint;
  stake: bigint;
  status: number;
  createdAt: bigint;
  completedAt: bigint;
  resultHash: string;
}

interface Host {
  registered: boolean;
  stake: bigint;
  reputation: bigint;
  completedJobs: bigint;
  nodeInfo: string;
}

interface AppState {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  account: string | null;
  coinBalance: bigint | null;
  isHost: boolean;
  hostInfo: Host | null;
  jobs: Job[];
  loading: boolean;
  error: string | null;
  
  // Actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  createJob: (jobSpec: string, price: string) => Promise<number>;
  acceptJob: (jobId: number) => Promise<void>;
  completeJob: (jobId: number, resultHash: string) => Promise<void>;
  registerHost: (nodeInfo: string) => Promise<void>;
  fetchJobs: () => Promise<void>;
  checkHostStatus: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  provider: null,
  signer: null,
  account: null,
  coinBalance: null,
  isHost: false,
  hostInfo: null,
  jobs: [],
  loading: false,
  error: null,

  connectWallet: async () => {
    try {
      set({ loading: true, error: null });
      
      if (!window.ethereum) {
        throw new Error('Please install MetaMask or a compatible wallet');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();

      // Check chain ID
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== CONTRACTS.chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${CONTRACTS.chainId.toString(16)}` }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            throw new Error('Please add BSC Testnet to your wallet');
          }
          throw switchError;
        }
      }

      set({ provider, signer, account });
      await get().refreshBalance();
      await get().checkHostStatus();
      await get().fetchJobs();
    } catch (err: any) {
      set({ error: err.message || 'Failed to connect wallet' });
    } finally {
      set({ loading: false });
    }
  },

  disconnectWallet: () => {
    set({ 
      provider: null, 
      signer: null, 
      account: null, 
      coinBalance: null,
      isHost: false,
      hostInfo: null,
      jobs: []
    });
  },

  refreshBalance: async () => {
    const { provider, account } = get();
    if (!provider || !account) return;

    try {
      const coinContract = new ethers.Contract(CONTRACTS.computeCoin, COMPUTE_COIN_ABI, provider);
      const balance = await coinContract.balanceOf(account);
      set({ coinBalance: balance });
    } catch (err: any) {
      console.error('Failed to fetch balance:', err);
    }
  },

  createJob: async (jobSpec: string, price: string) => {
    const { signer, account } = get();
    if (!signer || !account) throw new Error('Wallet not connected');

    try {
      set({ loading: true, error: null });

      const coinContract = new ethers.Contract(CONTRACTS.computeCoin, COMPUTE_COIN_ABI, signer);
      const marketplaceContract = new ethers.Contract(CONTRACTS.marketplace, MARKETPLACE_ABI, signer);

      const priceWei = ethers.parseEther(price);
      
      // Approve token transfer
      const approveTx = await coinContract.approve(CONTRACTS.marketplace, priceWei);
      await approveTx.wait();

      // Create job
      const createTx = await marketplaceContract.createJob(jobSpec, priceWei);
      const receipt = await createTx.wait();
      
      // Find JobCreated event
      const event = receipt?.logs.find((log: any) => {
        try {
          const parsed = marketplaceContract.interface.parseLog(log);
          return parsed?.name === 'JobCreated';
        } catch {
          return false;
        }
      });
      
      const jobId = event ? Number(event.args[0]) : 0;
      
      await get().fetchJobs();
      await get().refreshBalance();
      
      return jobId;
    } catch (err: any) {
      set({ error: err.reason || err.message || 'Failed to create job' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  acceptJob: async (jobId: number) => {
    const { signer } = get();
    if (!signer) throw new Error('Wallet not connected');

    try {
      set({ loading: true, error: null });
      const marketplaceContract = new ethers.Contract(CONTRACTS.marketplace, MARKETPLACE_ABI, signer);
      
      const tx = await marketplaceContract.acceptJob(jobId);
      await tx.wait();
      
      await get().fetchJobs();
    } catch (err: any) {
      set({ error: err.reason || err.message || 'Failed to accept job' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  completeJob: async (jobId: number, resultHash: string) => {
    const { signer } = get();
    if (!signer) throw new Error('Wallet not connected');

    try {
      set({ loading: true, error: null });
      const marketplaceContract = new ethers.Contract(CONTRACTS.marketplace, MARKETPLACE_ABI, signer);
      
      const tx = await marketplaceContract.completeJob(jobId, resultHash);
      await tx.wait();
      
      await get().fetchJobs();
      await get().refreshBalance();
    } catch (err: any) {
      set({ error: err.reason || err.message || 'Failed to complete job' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  registerHost: async (nodeInfo: string) => {
    const { signer } = get();
    if (!signer) throw new Error('Wallet not connected');

    try {
      set({ loading: true, error: null });
      
      const coinContract = new ethers.Contract(CONTRACTS.computeCoin, COMPUTE_COIN_ABI, signer);
      const marketplaceContract = new ethers.Contract(CONTRACTS.marketplace, MARKETPLACE_ABI, signer);

      // Get minimum stake
      const MIN_STAKE = await marketplaceContract.MIN_HOST_STAKE();
      
      // Approve token transfer
      const approveTx = await coinContract.approve(CONTRACTS.marketplace, MIN_STAKE);
      await approveTx.wait();

      // Register as host
      const registerTx = await marketplaceContract.registerHost(nodeInfo);
      await registerTx.wait();
      
      await get().checkHostStatus();
    } catch (err: any) {
      set({ error: err.reason || err.message || 'Failed to register as host' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  fetchJobs: async () => {
    const { provider } = get();
    if (!provider) return;

    try {
      const marketplaceContract = new ethers.Contract(CONTRACTS.marketplace, MARKETPLACE_ABI, provider);
      const jobCounter = await marketplaceContract.jobCounter();
      
      const jobsPromises = [];
      for (let i = 1; i <= Number(jobCounter); i++) {
        jobsPromises.push(marketplaceContract.jobs(i));
      }
      
      const jobsData = await Promise.all(jobsPromises);
      const jobs: Job[] = jobsData.map((job: any, index: number) => ({
        id: index + 1,
        client: job.client,
        host: job.host,
        jobSpec: job.jobSpec,
        price: job.price,
        stake: job.stake,
        status: Number(job.status),
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        resultHash: job.resultHash
      }));
      
      set({ jobs: jobs.reverse() }); // Show newest first
    } catch (err: any) {
      console.error('Failed to fetch jobs:', err);
    }
  },

  checkHostStatus: async () => {
    const { provider, account } = get();
    if (!provider || !account) return;

    try {
      const marketplaceContract = new ethers.Contract(CONTRACTS.marketplace, MARKETPLACE_ABI, provider);
      const hostInfo = await marketplaceContract.getHostInfo(account);
      
      set({ 
        isHost: hostInfo.registered,
        hostInfo: {
          registered: hostInfo.registered,
          stake: hostInfo.stake,
          reputation: hostInfo.reputation,
          completedJobs: hostInfo.completedJobs,
          nodeInfo: hostInfo.nodeInfo
        }
      });
    } catch (err: any) {
      console.error('Failed to check host status:', err);
    }
  }
}));
