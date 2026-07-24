import { create } from "zustand";
import { ethers } from "ethers";
import {
  CONTRACTS,
  COMPUTE_COIN_ABI,
  MARKETPLACE_ABI,
} from "../lib/constants";

export interface Job {
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
  resourceType: number;
  gpuCount: bigint;
  contextLength: bigint;
  isBatchJob: boolean;
  batchParentId: bigint;
}

export interface Host {
  registered: boolean;
  stake: bigint;
  reputation: bigint;
  completedJobs: bigint;
  nodeInfo: string;
  uptimeStart: bigint;
  totalUptime: bigint;
  lastHeartbeat: bigint;
  isCpuOnly: boolean;
  gpuCount: bigint;
  cpuCores: bigint;
  ramGB: bigint;
}

interface CreateJobParams {
  jobSpec: string;
  price: string; // CPT, human-readable (e.g. "1.50")
  resourceType?: number; // 0 = GPU, 1 = CPU, 2 = RAM
  gpuCount?: number;
  contextLength?: number;
}

interface RegisterHostParams {
  nodeInfo: string;
  gpuIds?: string[];
  gpuCount?: number;
  cpuCores?: number;
  ramGB?: number;
  cpuOnly?: boolean;
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
  createJob: (params: CreateJobParams) => Promise<number>;
  acceptJob: (jobId: number) => Promise<void>;
  completeJob: (jobId: number, resultHash: string) => Promise<void>;
  registerHost: (params: RegisterHostParams) => Promise<void>;
  submitHeartbeat: () => Promise<void>;
  fetchJobs: () => Promise<void>;
  checkHostStatus: () => Promise<void>;
  clearError: () => void;
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
        throw new Error("Please install MetaMask or a compatible wallet");
      }

      const provider = new ethers.BrowserProvider(window.ethereum as any);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();

      // Check chain ID
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== CONTRACTS.chainId) {
        try {
          await (window.ethereum as any).request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${CONTRACTS.chainId.toString(16)}` }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            throw new Error("Please add BSC Testnet to your wallet");
          }
          throw switchError;
        }
      }

      set({ provider, signer, account });
      await get().refreshBalance();
      await get().checkHostStatus();
      await get().fetchJobs();
    } catch (err: any) {
      set({ error: err.message || "Failed to connect wallet" });
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
      jobs: [],
      error: null,
    });
  },

  refreshBalance: async () => {
    const { provider, account } = get();
    if (!provider || !account) return;

    try {
      const coinContract = new ethers.Contract(
        CONTRACTS.computeCoin,
        COMPUTE_COIN_ABI,
        provider
      );
      const balance = await coinContract.balanceOf(account);
      set({ coinBalance: balance });
    } catch (err: any) {
      console.error("Failed to fetch balance:", err);
    }
  },

  createJob: async (params: CreateJobParams) => {
    const { signer, account } = get();
    if (!signer || !account) throw new Error("Wallet not connected");

    try {
      set({ loading: true, error: null });

      const coinContract = new ethers.Contract(
        CONTRACTS.computeCoin,
        COMPUTE_COIN_ABI,
        signer
      );
      const marketplaceContract = new ethers.Contract(
        CONTRACTS.marketplace,
        MARKETPLACE_ABI,
        signer
      );

      const priceWei = ethers.parseEther(params.price);
      const resourceType = params.resourceType ?? 0;
      const gpuCount = params.gpuCount ?? 1;
      const contextLength = params.contextLength ?? 4096;

      // Approve token transfer (marketplace will pull `priceWei` as escrow)
      const approveTx = await coinContract.approve(CONTRACTS.marketplace, priceWei);
      await approveTx.wait();

      // Create job — full signature per MARKETPLACE_ABI
      const createTx = await marketplaceContract.createJob(
        params.jobSpec,
        priceWei,
        resourceType,
        gpuCount,
        contextLength
      );
      const receipt = await createTx.wait();

      // Find JobCreated event
      const event = receipt?.logs.find((log: any) => {
        try {
          const parsed = marketplaceContract.interface.parseLog(log);
          return parsed?.name === "JobCreated";
        } catch {
          return false;
        }
      });

      const jobId = event ? Number(event.args[0]) : 0;

      await get().fetchJobs();
      await get().refreshBalance();

      return jobId;
    } catch (err: any) {
      set({ error: err.reason || err.message || "Failed to create job" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  acceptJob: async (jobId: number) => {
    const { signer } = get();
    if (!signer) throw new Error("Wallet not connected");

    try {
      set({ loading: true, error: null });
      const marketplaceContract = new ethers.Contract(
        CONTRACTS.marketplace,
        MARKETPLACE_ABI,
        signer
      );

      const tx = await marketplaceContract.acceptJob(jobId);
      await tx.wait();

      await get().fetchJobs();
    } catch (err: any) {
      set({ error: err.reason || err.message || "Failed to accept job" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  completeJob: async (jobId: number, resultHash: string) => {
    const { signer } = get();
    if (!signer) throw new Error("Wallet not connected");

    try {
      set({ loading: true, error: null });
      const marketplaceContract = new ethers.Contract(
        CONTRACTS.marketplace,
        MARKETPLACE_ABI,
        signer
      );

      // Accept either 0x-prefixed hex or arbitrary string; convert to bytes32
      let hashBytes: string;
      if (resultHash.startsWith("0x") && resultHash.length === 66) {
        hashBytes = resultHash;
      } else {
        // Hash arbitrary string into bytes32 via keccak256
        hashBytes = ethers.id(resultHash);
      }

      const tx = await marketplaceContract.completeJob(jobId, hashBytes);
      await tx.wait();

      await get().fetchJobs();
      await get().refreshBalance();
    } catch (err: any) {
      set({ error: err.reason || err.message || "Failed to complete job" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  registerHost: async (params: RegisterHostParams) => {
    const { signer } = get();
    if (!signer) throw new Error("Wallet not connected");

    try {
      set({ loading: true, error: null });

      const coinContract = new ethers.Contract(
        CONTRACTS.computeCoin,
        COMPUTE_COIN_ABI,
        signer
      );
      const marketplaceContract = new ethers.Contract(
        CONTRACTS.marketplace,
        MARKETPLACE_ABI,
        signer
      );

      // Determine stake threshold to approve
      const isCpuOnly = params.cpuOnly ?? false;
      const minStake = isCpuOnly
        ? await marketplaceContract.MIN_CPU_STAKE()
        : await marketplaceContract.MIN_HOST_STAKE();

      // Approve token transfer for stake
      const approveTx = await coinContract.approve(CONTRACTS.marketplace, minStake);
      await approveTx.wait();

      // Register host — pick the right entrypoint based on cpuOnly flag
      let registerTx;
      if (isCpuOnly) {
        registerTx = await marketplaceContract.registerCpuHost(
          params.nodeInfo,
          params.cpuCores ?? 4,
          params.ramGB ?? 8
        );
      } else {
        registerTx = await marketplaceContract.registerHost(
          params.nodeInfo,
          params.gpuIds ?? ["GPU-0"],
          params.gpuCount ?? 1,
          params.cpuCores ?? 8,
          params.ramGB ?? 16
        );
      }
      await registerTx.wait();

      await get().checkHostStatus();
      await get().refreshBalance();
    } catch (err: any) {
      set({ error: err.reason || err.message || "Failed to register as host" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  submitHeartbeat: async () => {
    const { signer } = get();
    if (!signer) throw new Error("Wallet not connected");

    try {
      set({ loading: true, error: null });
      const marketplaceContract = new ethers.Contract(
        CONTRACTS.marketplace,
        MARKETPLACE_ABI,
        signer
      );
      const tx = await marketplaceContract.submitHeartbeat();
      await tx.wait();
      await get().checkHostStatus();
    } catch (err: any) {
      set({ error: err.reason || err.message || "Failed to submit heartbeat" });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  fetchJobs: async () => {
    const { provider } = get();
    if (!provider) return;

    try {
      const marketplaceContract = new ethers.Contract(
        CONTRACTS.marketplace,
        MARKETPLACE_ABI,
        provider
      );
      const jobCounter = await marketplaceContract.jobCounter();

      const count = Number(jobCounter);
      if (count === 0) {
        set({ jobs: [] });
        return;
      }

      const jobsPromises = [];
      for (let i = 1; i <= count; i++) {
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
        resultHash: job.resultHash,
        resourceType: Number(job.resourceType),
        gpuCount: job.gpuCount,
        contextLength: job.contextLength,
        isBatchJob: job.isBatchJob,
        batchParentId: job.batchParentId,
      }));

      set({ jobs: jobs.reverse() }); // newest first
    } catch (err: any) {
      console.error("Failed to fetch jobs:", err);
    }
  },

  checkHostStatus: async () => {
    const { provider, account } = get();
    if (!provider || !account) return;

    try {
      const marketplaceContract = new ethers.Contract(
        CONTRACTS.marketplace,
        MARKETPLACE_ABI,
        provider
      );
      const hostInfo = await marketplaceContract.getHostInfo(account);

      set({
        isHost: hostInfo.registered,
        hostInfo: {
          registered: hostInfo.registered,
          stake: hostInfo.stake,
          reputation: hostInfo.reputation,
          completedJobs: hostInfo.completedJobs,
          nodeInfo: hostInfo.nodeInfo,
          uptimeStart: hostInfo.uptimeStart,
          totalUptime: hostInfo.totalUptime,
          lastHeartbeat: hostInfo.lastHeartbeat,
          isCpuOnly: hostInfo.isCpuOnly,
          gpuCount: hostInfo.gpuCount,
          cpuCores: hostInfo.cpuCores,
          ramGB: hostInfo.ramGB,
        },
      });
    } catch (err: any) {
      console.error("Failed to check host status:", err);
    }
  },

  clearError: () => set({ error: null }),
}));
