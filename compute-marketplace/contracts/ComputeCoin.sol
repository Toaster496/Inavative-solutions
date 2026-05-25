// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ComputeCoin (CPT)
 * @dev Native token for the compute marketplace
 * - Used for payments, staking, and governance
 * - 25% of all transaction fees go to protocol treasury
 */
contract ComputeCoin {
    string public name = "ComputeCoin";
    string public symbol = "CPT";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    address public owner;
    address public treasury;
    uint256 public constant TREASURY_FEE_BPS = 2500; // 25% in basis points
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1B tokens
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event TreasuryFeeCollected(uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        treasury = msg.sender;
        totalSupply = MAX_SUPPLY;
        balanceOf[msg.sender] = MAX_SUPPLY;
        emit Transfer(address(0), msg.sender, MAX_SUPPLY);
    }
    
    function transfer(address recipient, uint256 amount) external returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool) {
        require(allowance[sender][msg.sender] >= amount, "Allowance exceeded");
        allowance[sender][msg.sender] -= amount;
        _transfer(sender, recipient, amount);
        return true;
    }
    
    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(balanceOf[sender] >= amount, "Insufficient balance");
        
        uint256 treasuryFee = (amount * TREASURY_FEE_BPS) / 10000;
        uint256 amountAfterFee = amount - treasuryFee;
        
        balanceOf[sender] -= amount;
        balanceOf[recipient] += amountAfterFee;
        balanceOf[treasury] += treasuryFee;
        
        emit Transfer(sender, recipient, amountAfterFee);
        emit Transfer(sender, treasury, treasuryFee);
        emit TreasuryFeeCollected(treasuryFee);
    }
    
    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid address");
        treasury = newTreasury;
    }
}
