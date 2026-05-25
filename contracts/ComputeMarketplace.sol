// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ComputeCoin.sol";

/**
 * @title ComputeMarketplace
 * @dev Smart contract for managing compute job listings, escrow, and payments
 * Open marketplace model - hosts set their own prices, no auctions
 * Supports multi-GPU, CPU-only nodes, batch jobs, and oracle verification
 */
contract ComputeMarketplace {
    struct Job {
        uint256 id;
        address client;
        address host;
        string jobSpec; // IPFS hash of job specification
        uint256 price; // Price in CPT tokens (set by host in open marketplace)
        uint256 stake; // Host stake required
        JobStatus status;
        uint256 createdAt;
        uint256 completedAt;
        bytes32 resultHash; // Hash of computation result
        ResourceType resourceType;
        uint256 gpuCount;
        uint256 contextLength;
        bool isBatchJob;
        uint256 batchParentId;
    }
    
    enum JobStatus { Created, Accepted, Running, Completed, Disputed, Cancelled, Challenged }
    enum ResourceType { GPU, CPU, RAM }
    
    struct Host {
        bool registered;
        uint256 stake;
        uint256 reputation;
        uint256 completedJobs;
        string nodeInfo; // libp2p peer ID and connection info
        uint256 uptimeStart;
        uint256 totalUptime;
        uint256 lastHeartbeat;
        bool isCpuOnly;
        uint256 gpuCount;
        uint256 cpuCores;
        uint256 ramGB;
        string[] gpuIds;
    }
    
    struct Challenge {
        uint256 jobId;
        address challenger;
        uint256 challengeTime;
        bool resolved;
        bool fraudProven;
        bytes32 submittedHash;
        bytes32 verifiedHash;
    }
    
    struct BatchJob {
        uint256 id;
        address creator;
        uint256[] jobIds;
        uint256 totalJobs;
        uint256 completedJobs;
        bool completed;
    }
    
    ComputeCoin public token;
    mapping(uint256 => Job) public jobs;
    mapping(address => Host) public hosts;
    mapping(address => uint256[]) public clientJobs;
    mapping(address => uint256[]) public hostJobs;
    mapping(uint256 => Challenge) public challenges;
    mapping(uint256 => BatchJob) public batchJobs;
    mapping(uint256 => uint256) public jobToBatch;
    
    uint256 public jobCounter;
    uint256 public batchCounter;
    uint256 public challengeCounter;
    uint256 public constant MIN_HOST_STAKE = 100 * 10**18; // Minimum stake for GPU hosts
    uint256 public constant MIN_CPU_STAKE = 25 * 10**18; // Reduced stake for CPU-only hosts
    uint256 public constant CHALLENGE_WINDOW = 24 hours; // 24-hour challenge window
    uint256 public constant HEARTBEAT_INTERVAL = 5 minutes;
    
    event JobCreated(uint256 indexed jobId, address indexed client, uint256 price, ResourceType resourceType);
    event JobAccepted(uint256 indexed jobId, address indexed host);
    event JobCompleted(uint256 indexed jobId, bytes32 resultHash);
    event JobDisputed(uint256 indexed jobId);
    event ChallengeSubmitted(uint256 indexed challengeId, uint256 indexed jobId, address challenger);
    event ChallengeResolved(uint256 indexed challengeId, bool fraudProven);
    event HostRegistered(address indexed host, string nodeInfo, bool isCpuOnly);
    event StakeDeposited(address indexed host, uint256 amount);
    event StakeWithdrawn(address indexed host, uint256 amount);
    event HeartbeatReceived(address indexed host, uint256 timestamp);
    event BatchJobCreated(uint256 indexed batchId, uint256[] jobIds);
    event BatchJobCompleted(uint256 indexed batchId);
    
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
    
    modifier challengeWindowOpen(uint256 jobId) {
        require(block.timestamp <= jobs[jobId].completedAt + CHALLENGE_WINDOW, "Challenge window closed");
        _;
    }
    
    constructor(address _tokenAddress) {
        token = ComputeCoin(_tokenAddress);
    }
    
    /**
     * @dev Register as a host with GPU resources
     * @param nodeInfo libp2p peer ID and connection info
     * @param _gpuIds Array of GPU device IDs
     * @param _gpuCount Number of GPUs
     * @param _cpuCores Number of CPU cores
     * @param _ramGB Amount of RAM in GB
     */
    function registerHost(
        string memory nodeInfo,
        string[] memory _gpuIds,
        uint256 _gpuCount,
        uint256 _cpuCores,
        uint256 _ramGB
    ) external {
        require(!hosts[msg.sender].registered, "Already registered");
        require(token.transferFrom(msg.sender, address(this), MIN_HOST_STAKE), "Stake transfer failed");
        
        hosts[msg.sender] = Host({
            registered: true,
            stake: MIN_HOST_STAKE,
            reputation: 0,
            completedJobs: 0,
            nodeInfo: nodeInfo,
            uptimeStart: block.timestamp,
            totalUptime: 0,
            lastHeartbeat: block.timestamp,
            isCpuOnly: false,
            gpuCount: _gpuCount,
            cpuCores: _cpuCores,
            ramGB: _ramGB,
            gpuIds: _gpuIds
        });
        
        emit HostRegistered(msg.sender, nodeInfo, false);
        emit StakeDeposited(msg.sender, MIN_HOST_STAKE);
    }
    
    /**
     * @dev Register as a CPU-only host with reduced stake requirement
     * @param nodeInfo libp2p peer ID and connection info
     * @param _cpuCores Number of CPU cores
     * @param _ramGB Amount of RAM in GB
     */
    function registerCpuHost(
        string memory nodeInfo,
        uint256 _cpuCores,
        uint256 _ramGB
    ) external {
        require(!hosts[msg.sender].registered, "Already registered");
        require(token.transferFrom(msg.sender, address(this), MIN_CPU_STAKE), "Stake transfer failed");
        
        hosts[msg.sender] = Host({
            registered: true,
            stake: MIN_CPU_STAKE,
            reputation: 0,
            completedJobs: 0,
            nodeInfo: nodeInfo,
            uptimeStart: block.timestamp,
            totalUptime: 0,
            lastHeartbeat: block.timestamp,
            isCpuOnly: true,
            gpuCount: 0,
            cpuCores: _cpuCores,
            ramGB: _ramGB,
            gpuIds: new string[](0)
        });
        
        emit HostRegistered(msg.sender, nodeInfo, true);
        emit StakeDeposited(msg.sender, MIN_CPU_STAKE);
    }
    
    /**
     * @dev Submit heartbeat for uptime tracking
     */
    function submitHeartbeat() external onlyRegisteredHost {
        Host storage host = hosts[msg.sender];
        uint256 timeSinceLastHeartbeat = block.timestamp - host.lastHeartbeat;
        
        if (timeSinceLastHeartbeat <= HEARTBEAT_INTERVAL * 2) {
            host.totalUptime += timeSinceLastHeartbeat;
        }
        
        host.lastHeartbeat = block.timestamp;
        emit HeartbeatReceived(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Get host uptime percentage
     */
    function getHostUptime(address hostAddress) external view returns (uint256) {
        Host storage host = hosts[hostAddress];
        if (!host.registered || host.uptimeStart == 0) return 0;
        
        uint256 totalTime = block.timestamp - host.uptimeStart;
        if (totalTime == 0) return 100;
        
        return (host.totalUptime * 100) / totalTime;
    }
    
    /**
     * @dev Create a job with resource type specification
     * @param jobSpec IPFS hash of job specification
     * @param price Price in CPT tokens
     * @param resourceType Type of resource needed (GPU, CPU, RAM)
     * @param gpuCount Number of GPUs required (for GPU jobs)
     * @param contextLength Context length for LLM inference
     */
    function createJob(
        string memory jobSpec, 
        uint256 price,
        ResourceType resourceType,
        uint256 gpuCount,
        uint256 contextLength
    ) external returns (uint256) {
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
            resultHash: bytes32(0),
            resourceType: resourceType,
            gpuCount: gpuCount,
            contextLength: contextLength,
            isBatchJob: false,
            batchParentId: 0
        });
        
        clientJobs[msg.sender] = clientJobs[msg.sender].push(jobCounter);
        emit JobCreated(jobCounter, msg.sender, price, resourceType);
        
        return jobCounter;
    }
    
    /**
     * @dev Create a batch of jobs for parallel processing
     * @param jobSpecs Array of IPFS hashes for job specifications
     * @param prices Array of prices for each job
     * @param resourceType Type of resource needed
     * @param gpuCount Number of GPUs required per job
     */
    function createBatchJob(
        string[] memory jobSpecs,
        uint256[] memory prices,
        ResourceType resourceType,
        uint256 gpuCount
    ) external returns (uint256) {
        require(jobSpecs.length == prices.length, "Arrays length mismatch");
        require(jobSpecs.length > 0, "Empty batch");
        
        batchCounter++;
        uint256[] memory jobIds = new uint256[](jobSpecs.length);
        uint256 totalPrice = 0;
        
        for (uint256 i = 0; i < jobSpecs.length; i++) {
            require(prices[i] > 0, "Price must be positive");
            totalPrice += prices[i];
            
            jobCounter++;
            jobIds[i] = jobCounter;
            
            jobs[jobCounter] = Job({
                id: jobCounter,
                client: msg.sender,
                host: address(0),
                jobSpec: jobSpecs[i],
                price: prices[i],
                stake: 0,
                status: JobStatus.Created,
                createdAt: block.timestamp,
                completedAt: 0,
                resultHash: bytes32(0),
                resourceType: resourceType,
                gpuCount: gpuCount,
                contextLength: 0,
                isBatchJob: true,
                batchParentId: batchCounter
            });
            
            clientJobs[msg.sender] = clientJobs[msg.sender].push(jobCounter);
            jobToBatch[jobCounter] = batchCounter;
        }
        
        require(token.transferFrom(msg.sender, address(this), totalPrice), "Payment transfer failed");
        
        batchJobs[batchCounter] = BatchJob({
            id: batchCounter,
            creator: msg.sender,
            jobIds: jobIds,
            totalJobs: jobSpecs.length,
            completedJobs: 0,
            completed: false
        });
        
        emit BatchJobCreated(batchCounter, jobIds);
        
        return batchCounter;
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
        
        // Update batch job progress if applicable
        if (job.isBatchJob && job.batchParentId > 0) {
            batchJobs[job.batchParentId].completedJobs++;
            if (batchJobs[job.batchParentId].completedJobs >= batchJobs[job.batchParentId].totalJobs) {
                batchJobs[job.batchParentId].completed = true;
                emit BatchJobCompleted(job.batchParentId);
            }
        }
        
        emit JobCompleted(jobId, resultHash);
    }
    
    /**
     * @dev Submit a challenge/fraud proof against a completed job
     * @param jobId ID of the job to challenge
     * @param submittedHash Hash submitted by host
     * @param verifiedHash Correct hash from verification
     */
    function submitChallenge(
        uint256 jobId,
        bytes32 submittedHash,
        bytes32 verifiedHash
    ) external challengeWindowOpen(jobId) {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Completed, "Job not completed");
        require(!challenges[jobId].resolved, "Challenge already resolved");
        
        challengeCounter++;
        challenges[challengeCounter] = Challenge({
            jobId: jobId,
            challenger: msg.sender,
            challengeTime: block.timestamp,
            resolved: false,
            fraudProven: false,
            submittedHash: submittedHash,
            verifiedHash: verifiedHash
        });
        
        job.status = JobStatus.Challenged;
        emit ChallengeSubmitted(challengeCounter, jobId, msg.sender);
    }
    
    /**
     * @dev Resolve a challenge - called by oracle/verifier
     * @param challengeId ID of the challenge to resolve
     * @param fraudProven Whether fraud was proven
     */
    function resolveChallenge(uint256 challengeId, bool fraudProven) external {
        Challenge storage challenge = challenges[challengeId];
        require(!challenge.resolved, "Challenge already resolved");
        require(block.timestamp <= challenge.challengeTime + CHALLENGE_WINDOW, "Challenge window expired");
        
        challenge.resolved = true;
        challenge.fraudProven = fraudProven;
        
        if (fraudProven) {
            // Slash host stake and reward challenger
            Job storage job = jobs[challenge.jobId];
            uint256 slashAmount = hosts[job.host].stake / 2; // 50% slash
            hosts[job.host].stake -= slashAmount;
            
            // Reward challenger with half the slashed amount
            require(token.transfer(challenge.challenger, slashAmount / 2), "Reward transfer failed");
            
            // Refund client
            require(token.transfer(job.client, job.price), "Refund failed");
            
            job.status = JobStatus.Disputed;
        } else {
            // Challenge was false, release payment to host
            Job storage job = jobs[challenge.jobId];
            require(token.transfer(job.host, job.price), "Payment failed");
            job.status = JobStatus.Completed;
        }
        
        emit ChallengeResolved(challengeId, fraudProven);
    }
    
    /**
     * @dev Complete a batch job (mark all as done)
     * @param batchId ID of the batch job
     */
    function completeBatchJob(uint256 batchId) external {
        BatchJob storage batch = batchJobs[batchId];
        require(batch.creator == msg.sender, "Not batch creator");
        require(!batch.completed, "Already completed");
        
        uint256 completedCount = 0;
        for (uint256 i = 0; i < batch.jobIds.length; i++) {
            if (jobs[batch.jobIds[i]].status == JobStatus.Completed) {
                completedCount++;
            }
        }
        
        batch.completedJobs = completedCount;
        if (completedCount >= batch.totalJobs) {
            batch.completed = true;
            emit BatchJobCompleted(batchId);
        }
    }
    
    function cancelJob(uint256 jobId) external onlyJobClient(jobId) {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Created, "Cannot cancel");
        
        job.status = JobStatus.Cancelled;
        require(token.transfer(job.client, job.price), "Refund failed");
    }
    
    /**
     * @dev Withdraw stake (with minimum stake requirement)
     * @param amount Amount to withdraw
     */
    function withdrawStake(uint256 amount) external onlyRegisteredHost {
        Host storage host = hosts[msg.sender];
        uint256 minStake = host.isCpuOnly ? MIN_CPU_STAKE : MIN_HOST_STAKE;
        require(host.stake >= amount + minStake, "Insufficient stake");
        require(host.completedJobs > 0, "Must complete jobs first");
        
        host.stake -= amount;
        require(token.transfer(msg.sender, amount), "Withdrawal failed");
        
        emit StakeWithdrawn(msg.sender, amount);
    }
    
    /**
     * @dev Get detailed job information
     */
    function getJob(uint256 jobId) external view returns (Job memory) {
        return jobs[jobId];
    }
    
    /**
     * @dev Get detailed host information including uptime
     */
    function getHostInfo(address hostAddress) external view returns (Host memory) {
        return hosts[hostAddress];
    }
    
    /**
     * @dev Get batch job information
     */
    function getBatchJob(uint256 batchId) external view returns (BatchJob memory) {
        return batchJobs[batchId];
    }
    
    /**
     * @dev Get challenge information
     */
    function getChallenge(uint256 challengeId) external view returns (Challenge memory) {
        return challenges[challengeId];
    }
    
    /**
     * @dev Check if challenge window is still open for a job
     */
    function isChallengeWindowOpen(uint256 jobId) external view returns (bool) {
        Job storage job = jobs[jobId];
        return job.completedAt > 0 && block.timestamp <= job.completedAt + CHALLENGE_WINDOW;
    }
}
