import { create } from "zustand";
import { ethers } from "ethers";
import {
  CONTRACTS,
  COMPUTE_COIN_ABI,
  MARKETPLACE_ABI,
} from "../lib/constants";
import type { MarketplaceListing } from "../lib/constants";

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

export interface Rental {
  id: string;
  listingId: string;
  listingName: string;
  hardware: string;
  memory: string;
  region: string;
  tier: string;
  pricePerHour: number;
  hours: number;
  totalCost: number;
  startedAt: number;
  endedAt: number | null;
  status: 'active' | 'terminated';
}

interface CreateJobParams {
  jobSpec: string;
  price: string;
  resourceType?: number;
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

const DEMO_ACCOUNT = "0xDemo4f6e5A3a2D1cB7a889bF9c8d0Ef12345678AbCd";
const DEMO_BALANCE = ethers.parseEther("25000");
const DEMO_HOST_ADDR = "0xDemoB4d5e6F7a8b9C0d1E2f3A4b5C6d7E8f9A0b1C2";

function makeDemoJob(
  id: number,
  status: number,
  overrides?: Partial<Job>
): Job {
  return {
    id,
    client: DEMO_ACCOUNT,
    host: status === 0 ? ethers.ZeroAddress : DEMO_HOST_ADDR,
    jobSpec: [
      "Llama-3 8B fine-tuning on custom dataset",
      "Stable Diffusion XL batch generation (1024x1024)",
      "Whisper large-v3 transcription job",
      "Molecular docking simulation (AutoDock Vina)",
      "Blender Cycles render — 4K animation frames",
      "TensorFlow distributed training — ResNet-50",
    ][id % 6],
    price: ethers.parseEther(String([0.85, 1.2, 0.45, 2.1, 3.5, 0.6][id % 6])),
    stake: ethers.parseEther("10"),
    status,
    createdAt: BigInt(Math.floor(Date.now() / 1000) - (id + 1) * 3600),
    completedAt: status >= 3 ? BigInt(Math.floor(Date.now() / 1000) - id * 600) : BigInt(0),
    resultHash: status >= 3 ? `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}` : "",
    resourceType: [0, 0, 1, 0, 0, 1][id % 6],
    gpuCount: BigInt([1, 2, 0, 4, 1, 0][id % 6]),
    contextLength: BigInt([4096, 8192, 0, 32768, 0, 0][id % 6]),
    isBatchJob: false,
    batchParentId: BigInt(0),
    ...overrides,
  };
}

const DEMO_JOBS: Job[] = [
  makeDemoJob(1, 0, { client: "0xClientA3b2C1d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8A9" }),
  makeDemoJob(2, 0, { client: "0xClientB9c8D7e6F5a4B3c2D1e0F9a8B7c6D5e4F3a2B1" }),
  makeDemoJob(3, 1, { host: DEMO_HOST_ADDR }),
  makeDemoJob(4, 2, { host: DEMO_HOST_ADDR }),
  makeDemoJob(5, 3, { host: DEMO_HOST_ADDR }),
  makeDemoJob(6, 4),
  makeDemoJob(7, 5),
  makeDemoJob(8, 6),
  makeDemoJob(9, 0, { client: "0xClientC7d8E9f0A1b2C3d4E5f6A7b8C9d0E1f2A3b4C5" }),
  makeDemoJob(10, 1, { host: DEMO_HOST_ADDR }),
];

const DEMO_HOST_INFO: Host = {
  registered: true,
  stake: ethers.parseEther("500"),
  reputation: BigInt(92),
  completedJobs: BigInt(47),
  nodeInfo: "/ip4/192.168.1.42/tcp/4001/p2p/12D3KooWDemoHostNodeId123456789abc",
  uptimeStart: BigInt(Math.floor(Date.now() / 1000) - 86400 * 14),
  totalUptime: BigInt(86400 * 12),
  lastHeartbeat: BigInt(Math.floor(Date.now() / 1000) - 120),
  isCpuOnly: false,
  gpuCount: BigInt(2),
  cpuCores: BigInt(16),
  ramGB: BigInt(64),
};

interface AppState {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  account: string | null;
  coinBalance: bigint | null;
  isHost: boolean;
  hostInfo: Host | null;
  jobs: Job[];
  rentals: Rental[];
  loading: boolean;
  error: string | null;
  isDemoMode: boolean;

  connectWallet: () => Promise<void>;
  connectDemoWallet: () => void;
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
  rentGpu: (listing: MarketplaceListing, hours: number) => Promise<void>;
  terminateRental: (rentalId: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  provider: null,
  signer: null,
  account: null,
  coinBalance: null,
  isHost: false,
  hostInfo: null,
  jobs: [],
  rentals: [],
  loading: false,
  error: null,
  isDemoMode: false,

  connectWallet: async () => {
    try {
      set({ loading: true, error: null });
      if (!window.ethereum) {
        get().connectDemoWallet();
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== CONTRACTS.chainId) {
        try {
          await (window.ethereum as any).request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${CONTRACTS.chainId.toString(16)}` }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            set({ error: "Please add BSC Testnet to your wallet. Falling back to demo mode." });
            get().connectDemoWallet();
            return;
          }
          throw switchError;
        }
      }
      set({ provider, signer, account, isDemoMode: false });
      await get().refreshBalance();
      await get().checkHostStatus();
      await get().fetchJobs();
    } catch (err: any) {
      set({ error: err.message || "Failed to connect. Falling back to demo mode." });
      get().connectDemoWallet();
    } finally {
      set({ loading: false });
    }
  },

  connectDemoWallet: () => {
    set({
      account: DEMO_ACCOUNT,
      coinBalance: DEMO_BALANCE,
      isHost: true,
      hostInfo: DEMO_HOST_INFO,
      jobs: DEMO_JOBS,
      isDemoMode: true,
      error: null,
    });
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
      isDemoMode: false,
    });
  },

  refreshBalance: async () => {
    const { provider, account, isDemoMode } = get();
    if (isDemoMode) {
      set({ coinBalance: DEMO_BALANCE });
      return;
    }
    if (!provider || !account) return;
    try {
      const coinContract = new ethers.Contract(CONTRACTS.computeCoin, COMPUTE_COIN_ABI, provider);
      const balance = await coinContract.balanceOf(account);
      set({ coinBalance: balance });
    } catch (err: any) {
      console.error("Failed to fetch balance:", err);
    }
  },

  createJob: async (params: CreateJobParams) => {
    const { isDemoMode, signer, account } = get();
    if (!account) throw new Error("Wallet not connected");

    if (isDemoMode) {
      const newId = Math.max(0, ...get().jobs.map((j) => j.id)) + 1;
      const newJob = makeDemoJob(newId, 0, { client: account, jobSpec: params.jobSpec });
      set({ jobs: [newJob, ...get().jobs], coinBalance: DEMO_BALANCE - ethers.parseEther(params.price) });
      return newId;
    }

    if (!signer) throw new Error("Wallet not connected");
    try {
      set({ loading: true, error: null });
      const coinContract = new ethers.Contract(CONTRACTS.computeCoin, COMPUTE_COIN_ABI, signer);
      const marketplaceContract = new ethers.Contract(CONTRACTS.marketplace, MARKETPLACE_ABI, signer);
      const priceWei = ethers.parseEther(params.price);
      const approveTx = await coinContract.approve(CONTRACTS.marketplace, priceWei);
      await approveTx.wait();
      const createTx = await marketplaceContract.createJob(
        params.jobSpec, priceWei, params.resourceType ?? 0, params.gpuCount ?? 1, params.contextLength ?? 4096
      );
      const receipt = await createTx.wait();
      const event = receipt?.logs.find((log: any) => {
        try { return marketplaceContract.interface.parseLog(log)?.name === "JobCreated"; } catch { return false; }
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
    const { isDemoMode, signer, account } = get();
    if (!account) throw new Error("Wallet not connected");

    if (isDemoMode) {
      const updated = get().jobs.map((j) =>
        j.id === jobId ? { ...j, status: 1, host: account } : j
      );
      set({ jobs: updated });
      return;
    }

    if (!signer) throw new Error("Wallet not connected");
    try {
      set({ loading: true, error: null });
      const marketplaceContract = new ethers.Contract(CONTRACTS.marketplace, MARKETPLACE_ABI, signer);
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
    const { isDemoMode, signer, account } = get();
    if (!account) throw new Error("Wallet not connected");

    if (isDemoMode) {
      const updated = get().jobs.map((j) =>
        j.id === jobId ? { ...j, status: 3, resultHash: resultHash || `0x${"ab".repeat(32)}` } : j
      );
      set({ jobs: updated, coinBalance: get().coinBalance! + ethers.parseEther("0.5") });
      return;
    }

    if (!signer) throw new Error("Wallet not connected");
    try {
      set({ loading: true, error: null });
      const marketplaceContract = new ethers.Contract(CONTRACTS.marketplace, MARKETPLACE_ABI, signer);
      let hashBytes: string;
      if (resultHash.startsWith("0x") && resultHash.length === 66) {
        hashBytes = resultHash;
      } else {
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
    const { isDemoMode, signer, account } = get();
    if (!account) throw new Error("Wallet not connected");

    if (isDemoMode) {
      const newHost: Host = {
        registered: true,
        stake: ethers.parseEther("100"),
        reputation: BigInt(50),
        completedJobs: BigInt(0),
        nodeInfo: params.nodeInfo,
        uptimeStart: BigInt(Math.floor(Date.now() / 1000)),
        totalUptime: BigInt(0),
        lastHeartbeat: BigInt(Math.floor(Date.now() / 1000)),
        isCpuOnly: params.cpuOnly ?? false,
        gpuCount: BigInt(params.gpuCount ?? 1),
        cpuCores: BigInt(params.cpuCores ?? 8),
        ramGB: BigInt(params.ramGB ?? 16),
      };
      set({ isHost: true, hostInfo: newHost, coinBalance: get().coinBalance! - ethers.parseEther("100") });
      return;
    }

    if (!signer) throw new Error("Wallet not connected");
    try {
      set({ loading: true, error: null });
      const coinContract = new ethers.Contract(CONTRACTS.computeCoin, COMPUTE_COIN_ABI, signer);
      const marketplaceContract = new ethers.Contract(CONTRACTS.marketplace, MARKETPLACE_ABI, signer);
      const isCpuOnly = params.cpuOnly ?? false;
      const minStake = isCpuOnly
        ? await marketplaceContract.MIN_CPU_STAKE()
        : await marketplaceContract.MIN_HOST_STAKE();
      const approveTx = await coinContract.approve(CONTRACTS.marketplace, minStake);
      await approveTx.wait();
      let registerTx;
      if (isCpuOnly) {
        registerTx = await marketplaceContract.registerCpuHost(params.nodeInfo, params.cpuCores ?? 4, params.ramGB ?? 8);
      } else {
        registerTx = await marketplaceContract.registerHost(
          params.nodeInfo, params.gpuIds ?? ["GPU-0"], params.gpuCount ?? 1, params.cpuCores ?? 8, params.ramGB ?? 16
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
    const { isDemoMode, signer, hostInfo } = get();

    if (isDemoMode && hostInfo) {
      set({
        hostInfo: {
          ...hostInfo,
          lastHeartbeat: BigInt(Math.floor(Date.now() / 1000)),
          totalUptime: hostInfo.totalUptime + BigInt(300),
        },
      });
      return;
    }

    if (!signer) throw new Error("Wallet not connected");
    try {
      set({ loading: true, error: null });
      const marketplaceContract = new ethers.Contract(CONTRACTS.marketplace, MARKETPLACE_ABI, signer);
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
    const { isDemoMode, provider } = get();

    if (isDemoMode) {
      return;
    }

    if (!provider) return;
    try {
      const marketplaceContract = new ethers.Contract(CONTRACTS.marketplace, MARKETPLACE_ABI, provider);
      const jobCounter = await marketplaceContract.jobCounter();
      const count = Number(jobCounter);
      if (count === 0) { set({ jobs: [] }); return; }
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
      set({ jobs: jobs.reverse() });
    } catch (err: any) {
      console.error("Failed to fetch jobs:", err);
    }
  },

  checkHostStatus: async () => {
    const { isDemoMode, provider, account } = get();
    if (isDemoMode) return;
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

  rentGpu: async (listing: MarketplaceListing, hours: number) => {
    const { coinBalance } = get();
    if (!coinBalance) throw new Error("Wallet not connected");

    const cost = listing.pricePerHour * hours;
    const costWei = ethers.parseEther(cost.toFixed(18));

    if (coinBalance < costWei) {
      throw new Error(`Insufficient balance. Need ${cost.toFixed(2)} CPT`);
    }

    const rental: Rental = {
      id: `RENT_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      listingId: listing.id,
      listingName: listing.name,
      hardware: listing.hardware,
      memory: listing.memory,
      region: listing.region,
      tier: listing.tier,
      pricePerHour: listing.pricePerHour,
      hours,
      totalCost: cost,
      startedAt: Date.now(),
      endedAt: null,
      status: 'active',
    };

    set({
      rentals: [rental, ...get().rentals],
      coinBalance: coinBalance - costWei,
    });
  },

  terminateRental: async (rentalId: string) => {
    const { rentals } = get();
    const rental = rentals.find((r) => r.id === rentalId);
    if (!rental) throw new Error("Rental not found");
    if (rental.status !== 'active') throw new Error("Rental is not active");

    const elapsedHours = (Date.now() - rental.startedAt) / 3600000;
    const usedCost = rental.pricePerHour * Math.min(elapsedHours, rental.hours);
    const refund = Math.max(0, rental.totalCost - usedCost);
    const refundWei = ethers.parseEther(refund.toFixed(18));

    set({
      rentals: rentals.map((r) =>
        r.id === rentalId
          ? { ...r, status: 'terminated' as const, endedAt: Date.now() }
          : r
      ),
      coinBalance: get().coinBalance! + refundWei,
    });
  },
}));
