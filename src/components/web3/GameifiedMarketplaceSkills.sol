// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title GameifiedMarketplaceSkills
 * @dev Sistema de Skills NFTs
 * - Crear NFTs con skills
 * - Gestionar rarezas y tipos
 * - Validación de skills
 */

interface IGameifiedMarketplaceCore {
    function createStandardNFT(
        string calldata _tokenURI,
        string calldata _category,
        uint96 _royaltyPercentage
    ) external returns (uint256);
    
    function updateUserXP(address _user, uint256 _amount) external;
}

interface IStakingIntegration {
    enum SkillType {
        CODING,
        DESIGN,
        MARKETING,
        TRADING,
        COMMUNITY,
        WRITING
    }
    
    function notifySkillActivation(
        address user,
        uint256 nftId,
        SkillType skillType,
        uint16 effectValue
    ) external;
}

contract GameifiedMarketplaceSkills is AccessControl, Pausable {
    using Counters for Counters.Counter;
    
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    enum SkillType {
        CODING,
        DESIGN,
        MARKETING,
        TRADING,
        COMMUNITY,
        WRITING
    }
    
    enum Rarity {
        COMMON,
        UNCOMMON,
        RARE,
        EPIC,
        LEGENDARY
    }
    
    struct Skill {
        SkillType skillType;
        Rarity rarity;
        uint256 level;
        uint256 createdAt;
        uint256 expiresAt;      // ✅ NUEVO: Expiración de skill
    }
    
    struct SkillNFT {
        address creator;
        Skill[] skills;
        uint256 createdAt;
        uint256 basePrice;
    }
    
    Counters.Counter private _skillNFTCounter;
    
    // ✅ NUEVO: Máximo de skills activos simultáneos por usuario
    uint256 private constant MAX_ACTIVE_SKILLS_PER_USER = 3;
    uint256 private constant SKILL_DURATION = 30 days;
    
    // ✅ NUEVO: Track active skills per user per type
    mapping(address => mapping(SkillType => uint256)) public userActiveSkillsByType;
    mapping(address => mapping(SkillType => uint256)) public userSkillNFTId;
    
    mapping(uint256 => SkillNFT) public skillNFTs;
    mapping(address => uint256[]) public userSkillNFTs;
    mapping(SkillType => uint256) public skillTypeCount;
    mapping(uint256 => bool) public isFirstSkillFree;
    
    address public coreContractAddress;
    address public stakingContractAddress;
    
    event SkillNFTCreated(
        address indexed creator,
        uint256 indexed tokenId,
        uint256 skillCount,
        uint256 totalXP
    );
    event SkillAdded(uint256 indexed tokenId, SkillType skillType, Rarity rarity);
    event SkillExpired(address indexed user, uint256 indexed tokenId, SkillType skillType);
    event SkillRenewed(address indexed user, uint256 indexed tokenId, uint256 newExpiryTime);
    event SkillTypeAlreadyActive(address indexed user, SkillType skillType);

    error InvalidSkillCount();
    error InvalidSkillType();
    error CoreContractNotSet();
    error SkillTypeAlreadyActiveDuplicate(SkillType skillType);
    error MaxActiveSkillsReached();
    error SkillNotExpiredYet(uint256 expiryTime);
    error NotSkillOwner();

    constructor(address _coreAddress) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        coreContractAddress = _coreAddress;
    }

    /**
     * @dev Registrar skills a un NFT existente
     */
    function registerSkillsForNFT(
        uint256 _tokenId,
        SkillType[] calldata _skillTypes,
        Rarity[] calldata _rarities,
        uint256[] calldata _levels,
        uint256 _basePrice
    ) external whenNotPaused returns (uint256) {
        require(coreContractAddress != address(0), "Core not set");
        require(_skillTypes.length > 0 && _skillTypes.length <= 5, "Invalid skill count");
        require(_skillTypes.length == _rarities.length, "Length mismatch");
        require(_skillTypes.length == _levels.length, "Length mismatch");
        
        // ✅ NUEVO: Validar límite de skills activos
        uint256 activeSkillsCount = 0;
        for (uint256 k = 0; k < userSkillNFTs[msg.sender].length; k++) {
            if (block.timestamp < _getSkillExpiryTime(userSkillNFTs[msg.sender][k])) {
                activeSkillsCount++;
            }
        }
        require(activeSkillsCount < MAX_ACTIVE_SKILLS_PER_USER, "Max active skills reached");
        
        // Validar que no hay skill types repetidos
        for (uint256 i = 0; i < _skillTypes.length; i++) {
            for (uint256 j = i + 1; j < _skillTypes.length; j++) {
                require(_skillTypes[i] != _skillTypes[j], "Duplicate skill type");
            }
            require(uint256(_skillTypes[i]) < 6, "Invalid skill type");
            
            // ✅ NUEVO: Validar que no tenga este tipo de skill activo
            if (userActiveSkillsByType[msg.sender][_skillTypes[i]] != 0) {
                emit SkillTypeAlreadyActive(msg.sender, _skillTypes[i]);
                revert SkillTypeAlreadyActiveDuplicate(_skillTypes[i]);
            }
        }
        
        SkillNFT storage nft = skillNFTs[_tokenId];
        nft.creator = msg.sender;
        nft.createdAt = block.timestamp;
        nft.basePrice = _basePrice;
        
        uint256 totalXP = 0;
        uint256 expiryTime = block.timestamp + SKILL_DURATION;
        
        for (uint256 i = 0; i < _skillTypes.length; i++) {
            Skill memory skill = Skill({
                skillType: _skillTypes[i],
                rarity: _rarities[i],
                level: _levels[i],
                createdAt: block.timestamp,
                expiresAt: expiryTime  // ✅ NUEVO: Expiración
            });
            
            nft.skills.push(skill);
            skillTypeCount[_skillTypes[i]]++;
            
            // ✅ NUEVO: Registrar skill activo por tipo
            userActiveSkillsByType[msg.sender][_skillTypes[i]] = _tokenId;
            userSkillNFTId[msg.sender][_skillTypes[i]] = _tokenId;
            
            // Primera skill gratis, resto con costo
            if (i == 0) {
                isFirstSkillFree[_tokenId] = true;
                totalXP += 15;
            } else {
                totalXP += 10 + (uint256(_rarities[i]) * 5);
            }
            
            emit SkillAdded(_tokenId, _skillTypes[i], _rarities[i]);
        }
        
        userSkillNFTs[msg.sender].push(_tokenId);
        
        // Otorgar XP por agregar skills
        IGameifiedMarketplaceCore(coreContractAddress).updateUserXP(msg.sender, totalXP);
        
        // Notificar al staking sobre las skills activadas
        if (stakingContractAddress != address(0)) {
            for (uint256 i = 0; i < _skillTypes.length; i++) {
                uint16 skillValue = uint16(5 + (uint256(_rarities[i]) * 2));
                IStakingIntegration(stakingContractAddress).notifySkillActivation(
                    msg.sender,
                    _tokenId,
                    IStakingIntegration.SkillType(uint256(_skillTypes[i])),
                    skillValue
                );
            }
        }
        
        emit SkillNFTCreated(msg.sender, _tokenId, _skillTypes.length, totalXP);
        return _tokenId;
    }
    
    // ✅ NUEVO: Helper function para obtener tiempo de expiración
    function _getSkillExpiryTime(uint256 _tokenId) private view returns (uint256) {
        SkillNFT storage nft = skillNFTs[_tokenId];
        if (nft.skills.length == 0) return 0;
        return nft.skills[0].expiresAt;
    }
    
    // ✅ NUEVO: Deactivate expired skills
    function deactivateExpiredSkill(uint256 _tokenId) external {
        SkillNFT storage nft = skillNFTs[_tokenId];
        require(nft.creator != address(0), "Skill NFT not found");
        
        uint256 expiryTime = _getSkillExpiryTime(_tokenId);
        require(block.timestamp >= expiryTime, "Skill still active");
        
        // Limpiar tracking para cada skill
        for (uint256 i = 0; i < nft.skills.length; i++) {
            SkillType skillType = nft.skills[i].skillType;
            
            if (userActiveSkillsByType[nft.creator][skillType] == _tokenId) {
                userActiveSkillsByType[nft.creator][skillType] = 0;
                userSkillNFTId[nft.creator][skillType] = 0;
            }
            
            emit SkillExpired(nft.creator, _tokenId, skillType);
        }
    }
    
    // ✅ NUEVO: Renew expired skill
    function renewSkill(uint256 _tokenId) external payable whenNotPaused {
        SkillNFT storage nft = skillNFTs[_tokenId];
        require(nft.creator == msg.sender, "Not owner");
        
        uint256 expiryTime = _getSkillExpiryTime(_tokenId);
        require(block.timestamp >= expiryTime, "Skill still active");
        
        // Verificar pago
        uint256 renewalPrice = nft.basePrice / 2;
        require(msg.value >= renewalPrice, "Insufficient payment");
        
        // Renovar expiración
        uint256 newExpiryTime = block.timestamp + SKILL_DURATION;
        for (uint256 i = 0; i < nft.skills.length; i++) {
            nft.skills[i].expiresAt = newExpiryTime;
        }
        
        // Re-activar en staking
        if (stakingContractAddress != address(0)) {
            for (uint256 i = 0; i < nft.skills.length; i++) {
                uint16 skillValue = uint16(5 + (uint256(nft.skills[i].rarity) * 2));
                IStakingIntegration(stakingContractAddress).notifySkillActivation(
                    msg.sender,
                    _tokenId,
                    IStakingIntegration.SkillType(uint256(nft.skills[i].skillType)),
                    skillValue
                );
            }
        }
        
        emit SkillRenewed(msg.sender, _tokenId, newExpiryTime);
    }
    
    // ✅ NUEVO: Check if skill is expired
    function isSkillExpired(uint256 _tokenId) external view returns (bool) {
        uint256 expiryTime = _getSkillExpiryTime(_tokenId);
        return block.timestamp >= expiryTime;
    }
    
    // ✅ NUEVO: Get skill expiry time
    function getSkillExpiryTime(uint256 _tokenId) external view returns (uint256) {
        return _getSkillExpiryTime(_tokenId);
    }
    
    // ✅ NUEVO: Get active skills for user
    function getActiveSkillsForUser(address _user) external view returns (uint256[] memory) {
        uint256[] memory allSkills = userSkillNFTs[_user];
        uint256 activeCount = 0;
        
        for (uint256 i = 0; i < allSkills.length; i++) {
            if (block.timestamp < _getSkillExpiryTime(allSkills[i])) {
                activeCount++;
            }
        }
        
        uint256[] memory activeSkills = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allSkills.length; i++) {
            if (block.timestamp < _getSkillExpiryTime(allSkills[i])) {
                activeSkills[index] = allSkills[i];
                index++;
            }
        }
        
        return activeSkills;
    }

    /**
     * @dev Obtener skills de un NFT
     */
    function getSkillNFTSkills(uint256 _tokenId) external view returns (Skill[] memory) {
        return skillNFTs[_tokenId].skills;
    }

    /**
     * @dev Obtener información de Skill NFT
     */
    function getSkillNFT(uint256 _tokenId) external view returns (SkillNFT memory) {
        return skillNFTs[_tokenId];
    }

    /**
     * @dev Obtener skill NFTs del usuario
     */
    function getUserSkillNFTs(address _user) external view returns (uint256[] memory) {
        return userSkillNFTs[_user];
    }

    /**
     * @dev Obtener conteo de skill types
     */
    function getSkillTypeCount(SkillType _skillType) external view returns (uint256) {
        return skillTypeCount[_skillType];
    }

    /**
     * @dev Pause/Unpause
     */
    function setStakingContract(address _stakingAddress) external onlyRole(ADMIN_ROLE) {
        require(_stakingAddress != address(0), "Invalid address");
        stakingContractAddress = _stakingAddress;
    }

    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }
}
