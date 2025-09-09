// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Airdrops.sol";

/**
 * @title AirdropFactory
 * @dev Factory contract to deploy and manage multiple airdrop campaigns
 */
contract AirdropFactory {
    address public owner;
    
    struct AirdropInfo {
        address airdropContract;  // 20 bytes
        address token;           // 20 bytes
        uint64 deploymentTime;   // 8 bytes - sufficient until year 2554
        bool isActive;           // 1 byte
        // Total: 49 bytes, fits in 2 storage slots (64 bytes)
        string name;             // Dynamic, stored separately
    }
    
    AirdropInfo[] public airdrops;
    mapping(address => uint256[]) public ownerAirdrops;
    
    event AirdropDeployed(
        address indexed airdropContract, 
        address indexed owner, 
        address indexed token,
        string name,
        uint256 index
    );
    
    error Unauthorized();
    error InvalidInput();
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Deploy a new airdrop contract
     */
    function deployAirdrop(
        address _token,
        uint256 _registrationDuration,
        uint256 _claimDelay,
        uint256 _claimDuration,
        string memory _name
    ) external returns (address) {
        if (_token == address(0)) revert InvalidInput();
        if (bytes(_name).length == 0) revert InvalidInput();
        
        Airdrop newAirdrop = new Airdrop(
            _token,
            _registrationDuration,
            _claimDelay,
            _claimDuration
        );
        
        // Transfer ownership to the caller
        newAirdrop.transferOwnership(msg.sender);
        
        address airdropAddress = address(newAirdrop);
        
        // Store airdrop info with optimized storage
        AirdropInfo memory info = AirdropInfo({
            airdropContract: airdropAddress,
            token: _token,
            deploymentTime: uint64(block.timestamp),
            isActive: true,
            name: _name
        });
        
        airdrops.push(info);
        uint256 airdropIndex = airdrops.length - 1;
        ownerAirdrops[msg.sender].push(airdropIndex);
        
        emit AirdropDeployed(airdropAddress, msg.sender, _token, _name, airdropIndex);
        
        return airdropAddress;
    }
    
    /**
     * @dev Get all airdrops by owner
     */
    function getAirdropsByOwner(address _owner) external view returns (uint256[] memory) {
        return ownerAirdrops[_owner];
    }
    
    /**
     * @dev Get airdrop info by index
     */
    function getAirdropInfo(uint256 index) external view returns (AirdropInfo memory) {
        require(index < airdrops.length, "Invalid index");
        return airdrops[index];
    }
    
    /**
     * @dev Get total number of airdrops
     */
    function getTotalAirdrops() external view returns (uint256) {
        return airdrops.length;
    }
    
    /**
     * @dev Get multiple airdrop infos at once
     */
    function getAirdropInfoBatch(uint256[] calldata indices) external view returns (AirdropInfo[] memory) {
        AirdropInfo[] memory result = new AirdropInfo[](indices.length);
        for (uint256 i = 0; i < indices.length; i++) {
            require(indices[i] < airdrops.length, "Invalid index");
            result[i] = airdrops[indices[i]];
        }
        return result;
    }
    
    /**
     * @dev Deactivate an airdrop (only owner)
     */
    function deactivateAirdrop(uint256 index) external onlyOwner {
        require(index < airdrops.length, "Invalid index");
        airdrops[index].isActive = false;
    }

    /**
     * @dev Batch deactivate multiple airdrops (gas optimized)
     * @param indices Array of airdrop indices to deactivate
     */
    function batchDeactivateAirdrops(uint256[] calldata indices) external onlyOwner {
        require(indices.length <= 50, "Batch size too large");
        
        for (uint256 i = 0; i < indices.length; i++) {
            require(indices[i] < airdrops.length, "Invalid index");
            airdrops[indices[i]].isActive = false;
        }
    }

    /**
     * @dev Get paginated airdrops with gas optimization
     * @param offset Starting index
     * @param limit Maximum number of airdrops to return
     * @return airdropInfos Array of airdrop information
     * @return total Total number of airdrops
     */
    function getPaginatedAirdrops(uint256 offset, uint256 limit) 
        external 
        view 
        returns (AirdropInfo[] memory airdropInfos, uint256 total) 
    {
        total = airdrops.length;
        
        if (offset >= total) {
            return (new AirdropInfo[](0), total);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        airdropInfos = new AirdropInfo[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            airdropInfos[i - offset] = airdrops[i];
        }
    }

    /**
     * @dev Get active airdrops only (gas optimized)
     * @param offset Starting index
     * @param limit Maximum number of airdrops to return
     * @return activeAirdrops Array of active airdrop information
     * @return totalActive Total number of active airdrops
     */
    function getActiveAirdrops(uint256 offset, uint256 limit) 
        external 
        view 
        returns (AirdropInfo[] memory activeAirdrops, uint256 totalActive) 
    {
        // First pass: count active airdrops
        uint256 activeCount = 0;
        for (uint256 i = 0; i < airdrops.length; i++) {
            if (airdrops[i].isActive) {
                activeCount++;
            }
        }
        
        totalActive = activeCount;
        
        if (offset >= activeCount || activeCount == 0) {
            return (new AirdropInfo[](0), totalActive);
        }
        
        uint256 end = offset + limit;
        if (end > activeCount) {
            end = activeCount;
        }
        
        activeAirdrops = new AirdropInfo[](end - offset);
        uint256 activeIndex = 0;
        uint256 resultIndex = 0;
        
        // Second pass: collect active airdrops in range
        for (uint256 i = 0; i < airdrops.length && resultIndex < (end - offset); i++) {
            if (airdrops[i].isActive) {
                if (activeIndex >= offset) {
                    activeAirdrops[resultIndex] = airdrops[i];
                    resultIndex++;
                }
                activeIndex++;
            }
        }
    }
}
