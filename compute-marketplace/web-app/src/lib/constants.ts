// Contract ABIs and Addresses - Update after deployment
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
  "function jobs(uint256) view returns (uint256 id, address client, address host, string jobSpec, uint256 price, uint256 stake, uint8 status, uint256 createdAt, uint256 completedAt, bytes32 resultHash)",
  "function hosts(address) view returns (bool registered, uint256 stake, uint256 reputation, uint256 completedJobs, string nodeInfo)",
  "function createJob(string memory jobSpec, uint256 price) returns (uint256)",
  "function acceptJob(uint256 jobId)",
  "function completeJob(uint256 jobId, bytes32 resultHash)",
  "function registerHost(string memory nodeInfo)",
  "function getJob(uint256 jobId) view returns (uint256 id, address client, address host, string jobSpec, uint256 price, uint256 stake, uint8 status, uint256 createdAt, uint256 completedAt, bytes32 resultHash)",
  "function getHostInfo(address hostAddress) view returns (bool registered, uint256 stake, uint256 reputation, uint256 completedJobs, string nodeInfo)",
  "event JobCreated(uint256 indexed jobId, address indexed client, uint256 price)",
  "event JobAccepted(uint256 indexed jobId, address indexed host)",
  "event JobCompleted(uint256 indexed jobId, bytes32 resultHash)"
];

export const JOB_STATUS = {
  Created: 0,
  Accepted: 1,
  Running: 2,
  Completed: 3,
  Disputed: 4,
  Cancelled: 5
};

export const JOB_STATUS_LABELS = {
  0: 'Open',
  1: 'Accepted',
  2: 'Running',
  3: 'Completed',
  4: 'Disputed',
  5: 'Cancelled'
};
