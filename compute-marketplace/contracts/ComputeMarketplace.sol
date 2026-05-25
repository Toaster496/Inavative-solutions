// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ComputeCoin.sol";

/**
 * @title ComputeMarketplace
 * @dev Smart contract for managing compute job listings, escrow, and payments
 */
contract ComputeMarketplace {
    struct Job {
        uint256 id;
        address client;
        address host;
        string jobSpec; // IPFS hash of job specification
        uint256 price; // Price in CPT tokens
        uint256 stake; // Host stake required
        JobStatus status;
        uint256 createdAt;
        uint256 completedAt;
        bytes32 resultHash; // Hash of computation result
    }
    
    enum JobStatus { Created, Accepted, Running, Completed, Disputed, Cancelled }
    
    struct Host {
        bool registered;
        uint256 stake;
        uint256 reputation;
        uint256 completedJobs;
        string nodeInfo; // libp2p peer ID and connection info
    }
    
    ComputeCoin public token;
    mapping(uint256 => Job) public jobs;
    mapping(address => Host) public hosts;
    mapping(address => uint256[]) public clientJobs;
    mapping(address => uint256[]) public hostJobs;
    
    uint256 public jobCounter;
    uint256 public constant MIN_HOST_STAKE = 100 * 10**18; // Minimum stake to become host
    
    event JobCreated(uint256 indexed jobId, address indexed client, uint256 price);
    event JobAccepted(uint256 indexed jobId, address indexed host);
    event JobCompleted(uint256 indexed jobId, bytes32 resultHash);
    event JobDisputed(uint256 indexed jobId);
    event HostRegistered(address indexed host, string nodeInfo);
    event StakeDeposited(address indexed host, uint256 amount);
    event StakeWithdrawn(address indexed host, uint256 amount);
    
    modifier onlyRegisteredHost() {
        require(hosts[msg.sender].registered, "Not a registered host");
        _;
    }
    
    modifier onlyJobClient(uint256 jobId) {
        require(jobs[jobId].client == msg.sender, "Not job client");
        _;
    }
    
    modifier onlyJobHost(uint256 jobId) {
        require(jobs[jobId].host == msg.sender, "Not job host");
        _;
    }
    
    constructor(address _tokenAddress) {
        token = ComputeCoin(_tokenAddress);
    }
    
    function registerHost(string memory nodeInfo) external {
        require(!hosts[msg.sender].registered, "Already registered");
        require(token.transferFrom(msg.sender, address(this), MIN_HOST_STAKE), "Stake transfer failed");
        
        hosts[msg.sender] = Host({
            registered: true,
            stake: MIN_HOST_STAKE,
            reputation: 0,
            completedJobs: 0,
            nodeInfo: nodeInfo
        });
        
        emit HostRegistered(msg.sender, nodeInfo);
        emit StakeDeposited(msg.sender, MIN_HOST_STAKE);
    }
    
    function createJob(string memory jobSpec, uint256 price) external returns (uint256) {
        require(price > 0, "Price must be positive");
        require(token.transferFrom(msg.sender, address(this), price), "Payment transfer failed");
        
        jobCounter++;
        jobs[jobCounter] = Job({
            id: jobCounter,
            client: msg.sender,
            host: address(0),
            jobSpec: jobSpec,
            price: price,
            stake: 0,
            status: JobStatus.Created,
            createdAt: block.timestamp,
            completedAt: 0,
            resultHash: bytes32(0)
        });
        
        clientJobs[msg.sender] = clientJobs[msg.sender].push(jobCounter);
        emit JobCreated(jobCounter, msg.sender, price);
        
        return jobCounter;
    }
    
    function acceptJob(uint256 jobId) external onlyRegisteredHost {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Created, "Job not available");
        require(job.host == address(0), "Job already accepted");
        
        job.host = msg.sender;
        job.status = JobStatus.Accepted;
        
        hostJobs[msg.sender] = hostJobs[msg.sender].push(jobId);
        emit JobAccepted(jobId, msg.sender);
    }
    
    function completeJob(uint256 jobId, bytes32 resultHash) external onlyJobHost(jobId) {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Accepted || job.status == JobStatus.Running, "Invalid job status");
        
        job.resultHash = resultHash;
        job.status = JobStatus.Completed;
        job.completedAt = block.timestamp;
        
        // Pay host (price minus 25% fee already taken by token transfer)
        require(token.transfer(job.host, job.price), "Payment failed");
        
        // Update host reputation
        hosts[job.host].reputation += 10;
        hosts[job.host].completedJobs++;
        
        emit JobCompleted(jobId, resultHash);
    }
    
    function disputeJob(uint256 jobId) external onlyJobClient(jobId) {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Accepted || job.status == JobStatus.Running, "Cannot dispute");
        
        job.status = JobStatus.Disputed;
        emit JobDisputed(jobId);
        // Dispute resolution logic would go here (oracle/challenge system)
    }
    
    function cancelJob(uint256 jobId) external onlyJobClient(jobId) {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Created, "Cannot cancel");
        
        job.status = JobStatus.Cancelled;
        require(token.transfer(job.client, job.price), "Refund failed");
    }
    
    function withdrawStake(uint256 amount) external onlyRegisteredHost {
        Host storage host = hosts[msg.sender];
        require(host.stake >= amount + MIN_HOST_STAKE, "Insufficient stake");
        require(host.completedJobs > 0, "Must complete jobs first");
        
        host.stake -= amount;
        require(token.transfer(msg.sender, amount), "Withdrawal failed");
        
        emit StakeWithdrawn(msg.sender, amount);
    }
    
    function getJob(uint256 jobId) external view returns (Job memory) {
        return jobs[jobId];
    }
    
    function getHostInfo(address hostAddress) external view returns (Host memory) {
        return hosts[hostAddress];
    }
}
