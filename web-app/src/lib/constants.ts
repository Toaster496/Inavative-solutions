// Contract ABIs and Addresses - Update after deployment to BSC Testnet
export const CONTRACTS = {
  // These will be updated after deployment to BSC Testnet
  computeCoin: import.meta.env.VITE_COMPUTE_COIN_ADDRESS || '0x0000000000000000000000000000000000000000',
  marketplace: import.meta.env.VITE_MARKETPLACE_ADDRESS || '0x0000000000000000000000000000000000000000',
  chainId: 97, // BSC Testnet
  rpcUrl: 'https://data-seed-preload1-s1.bscnode.com/'
};

export const COMPUTE_COIN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address,uint256) returns (bool)",
  "function approve(address,uint256) returns (bool)",
  "function allowance(address,address) view returns (uint256)",
  "function transferFrom(address,address,uint256) returns (bool)"
];

export const MARKETPLACE_ABI = [
  "function jobCounter() view returns (uint256)",
  "function batchCounter() view returns (uint256)",
  "function challengeCounter() view returns (uint256)",
  "function MIN_HOST_STAKE() view returns (uint256)",
  "function MIN_CPU_STAKE() view returns (uint256)",
  "function CHALLENGE_WINDOW() view returns (uint256)",
  "function jobs(uint256) view returns (uint256 id, address client, address host, string jobSpec, uint256 price, uint256 stake, uint8 status, uint256 createdAt, uint256 completedAt, bytes32 resultHash, uint8 resourceType, uint256 gpuCount, uint256 contextLength, bool isBatchJob, uint256 batchParentId)",
  "function hosts(address) view returns (bool registered, uint256 stake, uint256 reputation, uint256 completedJobs, string nodeInfo, uint256 uptimeStart, uint256 totalUptime, uint256 lastHeartbeat, bool isCpuOnly, uint256 gpuCount, uint256 cpuCores, uint256 ramGB)",
  "function batchJobs(uint256) view returns (uint256 id, address creator, uint256[] jobIds, uint256 totalJobs, uint256 completedJobs, bool completed)",
  "function challenges(uint256) view returns (uint256 jobId, address challenger, uint256 challengeTime, bool resolved, bool fraudProven, bytes32 submittedHash, bytes32 verifiedHash)",
  "function registerHost(string memory nodeInfo, string[] memory gpuIds, uint256 gpuCount, uint256 cpuCores, uint256 ramGB)",
  "function registerCpuHost(string memory nodeInfo, uint256 cpuCores, uint256 ramGB)",
  "function submitHeartbeat()",
  "function getHostUptime(address hostAddress) view returns (uint256)",
  "function createJob(string memory jobSpec, uint256 price, uint8 resourceType, uint256 gpuCount, uint256 contextLength) returns (uint256)",
  "function createBatchJob(string[] memory jobSpecs, uint256[] memory prices, uint8 resourceType, uint256 gpuCount) returns (uint256)",
  "function acceptJob(uint256 jobId)",
  "function completeJob(uint256 jobId, bytes32 resultHash)",
  "function submitChallenge(uint256 jobId, bytes32 submittedHash, bytes32 verifiedHash)",
  "function resolveChallenge(uint256 challengeId, bool fraudProven)",
  "function completeBatchJob(uint256 batchId)",
  "function withdrawStake(uint256 amount)",
  "function getJob(uint256 jobId) view returns (uint256 id, address client, address host, string jobSpec, uint256 price, uint256 stake, uint8 status, uint256 createdAt, uint256 completedAt, bytes32 resultHash, uint8 resourceType, uint256 gpuCount, uint256 contextLength, bool isBatchJob, uint256 batchParentId)",
  "function getHostInfo(address hostAddress) view returns (bool registered, uint256 stake, uint256 reputation, uint256 completedJobs, string nodeInfo, uint256 uptimeStart, uint256 totalUptime, uint256 lastHeartbeat, bool isCpuOnly, uint256 gpuCount, uint256 cpuCores, uint256 ramGB)",
  "function getBatchJob(uint256 batchId) view returns (uint256 id, address creator, uint256[] jobIds, uint256 totalJobs, uint256 completedJobs, bool completed)",
  "function isChallengeWindowOpen(uint256 jobId) view returns (bool)",
  "event JobCreated(uint256 indexed jobId, address indexed client, uint256 price, uint8 resourceType)",
  "event JobAccepted(uint256 indexed jobId, address indexed host)",
  "event JobCompleted(uint256 indexed jobId, bytes32 resultHash)",
  "event ChallengeSubmitted(uint256 indexed challengeId, uint256 indexed jobId, address challenger)",
  "event ChallengeResolved(uint256 indexed challengeId, bool fraudProven)",
  "event HostRegistered(address indexed host, string nodeInfo, bool isCpuOnly)",
  "event BatchJobCreated(uint256 indexed batchId, uint256[] jobIds)",
  "event BatchJobCompleted(uint256 indexed batchId)"
];

export const JOB_STATUS = {
  Created: 0,
  Accepted: 1,
  Running: 2,
  Completed: 3,
  Disputed: 4,
  Cancelled: 5,
  Challenged: 6
};

export const JOB_STATUS_LABELS = {
  0: 'Open',
  1: 'Accepted',
  2: 'Running',
  3: 'Completed',
  4: 'Disputed',
  5: 'Cancelled',
  6: 'Challenged'
};

export const RESOURCE_TYPE = {
  GPU: 0,
  CPU: 1,
  RAM: 2
};

export const RESOURCE_TYPE_LABELS = {
  0: 'GPU',
  1: 'CPU',
  2: 'RAM'
};

// Popular LLM models for the Model Library
export const MODEL_LIBRARY = [
  {
    id: 'llama-3-8b',
    name: 'Llama 3 8B',
    params: 8,
    description: 'Meta\'s latest efficient language model',
    recommendedVRAM: 16,
    quantizations: ['Q4_K_M', 'Q5_K_M', 'Q8_0', 'F16']
  },
  {
    id: 'llama-3-70b',
    name: 'Llama 3 70B',
    params: 70,
    description: 'Meta\'s powerful large language model',
    recommendedVRAM: 140,
    quantizations: ['Q4_K_M', 'Q5_K_M', 'Q8_0']
  },
  {
    id: 'mistral-7b',
    name: 'Mistral 7B',
    params: 7,
    description: 'High-performance open-weight model',
    recommendedVRAM: 14,
    quantizations: ['Q4_K_M', 'Q5_K_M', 'Q8_0', 'F16']
  },
  {
    id: 'gemma-7b',
    name: 'Gemma 7B',
    params: 7,
    description: 'Google\'s lightweight open model',
    recommendedVRAM: 14,
    quantizations: ['Q4_K_M', 'Q5_K_M', 'Q8_0', 'F16']
  },
  {
    id: 'phi-3-mini',
    name: 'Phi-3 Mini',
    params: 3.8,
    description: 'Microsoft\'s compact but capable model',
    recommendedVRAM: 8,
    quantizations: ['Q4_K_M', 'Q5_K_M', 'Q8_0', 'F16']
  },
  {
    id: 'phi-3-medium',
    name: 'Phi-3 Medium',
    params: 14,
    description: 'Microsoft\'s mid-sized powerful model',
    recommendedVRAM: 28,
    quantizations: ['Q4_K_M', 'Q5_K_M', 'Q8_0']
  }
];

/**
 * Calculate VRAM requirements for LLM inference
 * Formula: VRAM_GB = (Params_B × bytes_per_param × context_length/1024) + overhead
 */
export function calculateVRAM(
  paramsBillions: number,
  quantization: string,
  contextLength: number
): number {
  // Bytes per parameter based on quantization
  const bytesPerParam: Record<string, number> = {
    'Q4_K_M': 0.5,
    'Q5_K_M': 0.625,
    'Q8_0': 1.0,
    'F16': 2.0,
    'F32': 4.0
  };
  
  const bpp = bytesPerParam[quantization] || 0.5;
  const baseVRAM = paramsBillions * bpp * (contextLength / 1024);
  
  // Add overhead for KV cache and activations (approximately 20%)
  const overhead = baseVRAM * 0.2;
  
  return Math.round((baseVRAM + overhead) * 10) / 10;
}

// ----------------------------------------------------------------------------
// Marketplace listings — illustrative catalog shown on the Marketplace page.
// These are demo rows; real listings should come from an indexer / subgraph
// that reads host registrations and live heartbeats from the marketplace
// contract. Replace MARKETPLACE_LISTINGS with on-chain data when ready.
// ----------------------------------------------------------------------------
export interface MarketplaceListing {
  id: string;
  name: string;
  hardware: string;
  memory: string;
  region: string;
  pricePerHour: number;
  online: boolean;
  tier: 'Premium' | 'Enterprise' | 'Value' | 'Ultra_Verified' | 'Maintenance';
  icon: string; // Material Symbols Outlined icon name
}

export const MARKETPLACE_LISTINGS: MarketplaceListing[] = [
  { id: 'alpha-92',       name: 'Alpha-92',        hardware: 'RTX 4090 x1',  memory: '24GB GDDR6X', region: 'US-W', pricePerHour: 0.42, online: true,  tier: 'Premium',        icon: 'developer_board' },
  { id: 'datacluster-x',  name: 'DataCluster-X',   hardware: 'A100 SXM4',    memory: '80GB HBM2e',  region: 'EU-C', pricePerHour: 1.85, online: true,  tier: 'Enterprise',     icon: 'dns' },
  { id: 'computefarm-3',  name: 'ComputeFarm_3',   hardware: 'RTX 3090',     memory: '24GB GDDR6X', region: 'AS-E', pricePerHour: 0.25, online: true,  tier: 'Value',          icon: 'grid_view' },
  { id: 'deeplearn-titan',name: 'DeepLearn-Titan', hardware: 'H100 80GB',    memory: '80GB HBM3',   region: 'US-E', pricePerHour: 4.10, online: true,  tier: 'Ultra_Verified', icon: 'bolt' },
  { id: 'homeworker-7',   name: 'HomeWorker-7',    hardware: '3080 Ti',      memory: '12GB GDDR6X', region: 'CA-W', pricePerHour: 0.18, online: false, tier: 'Maintenance',    icon: 'settings_input_component' },
  { id: 'quantum-edge',   name: 'Quantum_Edge',    hardware: 'RTX 4080',     memory: '16GB GDDR6X', region: 'EU-N', pricePerHour: 0.55, online: true,  tier: 'Premium',        icon: 'developer_board' },
  { id: 'nebula-cluster', name: 'Nebula_Cluster',  hardware: 'A100 x2',      memory: '160GB HBM2e', region: 'US-W', pricePerHour: 3.20, online: true,  tier: 'Enterprise',     icon: 'dns' },
  { id: 'forge-mk2',      name: 'Forge_MK2',       hardware: 'RTX 5090',     memory: '32GB GDDR7',  region: 'AS-S', pricePerHour: 0.95, online: true,  tier: 'Ultra_Verified', icon: 'bolt' }
];

// ----------------------------------------------------------------------------
// Network stats — displayed on the Home and Token pages.
// Mock numbers that match the wireframe; replace with on-chain reads.
// ----------------------------------------------------------------------------
export const NETWORK_STATS = {
  activeNodes: 5400,
  totalCapacityPFLOPS: 2.1,
  avgPriceRtx3090: 0.18,
  totalSupply: 1_000_000_000,
  protocolFeePct: 25,
  minHostStake: 100,
  totalNodesActive: 1248,
  currentEpoch: 14209,
  vramAllocationPct: 82.4,
  bandwidthPct: 45.1
};

// ----------------------------------------------------------------------------
// Demo host hardware logs — shown on the Operator Console (Dashboard).
// Real values should be reported by the desktop host daemon via heartbeats.
// ----------------------------------------------------------------------------
export interface HardwareLog {
  model: string;
  spec: string;
  loadPct: number;
  icon: string;
}

export const HARDWARE_LOGS: HardwareLog[] = [
  { model: 'NVIDIA H100 Tensor Core', spec: 'PCIe Gen 5 | 80GB HBM3',  loadPct: 75, icon: 'memory' },
  { model: 'AMD EPYC 9654',           spec: '96 Cores | 192 Threads',  loadPct: 25, icon: 'developer_board' },
  { model: 'NVIDIA RTX 4090',         spec: '24GB GDDR6X | 16384 CUDA', loadPct: 60, icon: 'memory' }
];

// ----------------------------------------------------------------------------
// Demo executing jobs — shown on the Operator Console (Dashboard) "Executing"
// tab. Replace with on-chain reads via jobs(host) once the host daemon is live.
// ----------------------------------------------------------------------------
export interface ExecutingJob {
  id: string;
  label: string;
  rateCptPerHour: number;
  progressPct: number;
  resultHash: string;
  icon: string;
}

export const EXECUTING_JOBS: ExecutingJob[] = [
  { id: 'JOB_8294_B', label: 'Llama-3 Fine-tuning', rateCptPerHour: 0.45, progressPct: 64, resultHash: '0x8f2c...41e9d20c3a8f5b1d4e2a9f0c', icon: 'settings_b_roll' },
  { id: 'JOB_7741_A', label: 'Molecular Docking',   rateCptPerHour: 1.20, progressPct: 12, resultHash: '0xa7b1...9c2d1e0f3b4a5d6e7f8g9h', icon: 'science' },
  { id: 'JOB_8301_C', label: 'Stable Diffusion Batch', rateCptPerHour: 0.85, progressPct: 88, resultHash: '0x3c8d...772910ab4f8e2d1c0b3a6e9d', icon: 'image' },
  { id: 'JOB_8210_A', label: 'Whisper Transcription', rateCptPerHour: 0.30, progressPct: 38, resultHash: '0xff10...8841ace02b6d9e3a1f5c4b7e', icon: 'graphic_eq' }
];

// Helper: short-form wallet address
export function shortAddr(addr: string | null | undefined, head = 6, tail = 4): string {
  if (!addr) return '—';
  if (addr.length <= head + tail + 2) return addr;
  return `${addr.slice(0, head)}...${addr.slice(-tail)}`;
}

// Helper: convert wei bigint to CPT display string
export function formatCpt(wei: bigint | null | undefined, dp = 2): string {
  if (!wei) return '0.00';
  const whole = Number(wei) / 1e18;
  return whole.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp });
}
