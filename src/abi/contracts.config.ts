/**
 * Contract Configuration para Frontend
 * Direcciones y ABIs - Polygon Mainnet
 * Fecha: 15 de Febrero de 2026
 * 
 * AUTO-GENERADO: Actualizar con Hardhat deployment script
 * Ubicación HDL: `npx hardhat run scripts/export-abis.ts`
 */

// ============================================
// Tipos TypeScript
// ============================================
export interface ContractAddresses {
  // Contratos Principales
  GameifiedMarketplaceProxy: string;
  GameifiedMarketplaceCore: string;
  
  // Módulos de Habilidades y NFTs
  IndividualSkills: string;
  GameifiedMarketplaceSkills: string;
  GameifiedMarketplaceQuests: string;
  
  // Sistema de Niveles y Referidos
  LevelingSystem: string;
  ReferralSystem: string;
  
  // Contratos Individuales
  IndividualSkillsMarketplace: string;
  IndividualSkillsMarketplaceImpl: string;
  
  // Staking y Rewards
  EnhancedSmartStaking: string;
  EnhancedSmartStakingRewards: string;
  EnhancedSmartStakingSkills: string;
  EnhancedSmartStakingGamification: string;
  EnhancedSmartStakingViewer: string;
  
  // Utilidades
  DynamicAPYCalculator: string;
  CollaboratorBadgeRewards: string;
  TreasuryManager: string;
  
  // Marketplace Views
  MarketplaceView: string;
  MarketplaceSocial: string;
  MarketplaceStatistics: string;
}

export interface UserProfile {
  totalXP: number;
  level: number;
  nftsCreated: number;
  nftsOwned: number;
  nftsSold: number;
  nftsBought: number;
}

export interface Skill {
  skillType: SkillType;
  rarity: Rarity;
  level: number;
  createdAt: number;
}

export interface Quest {
  questId: number;
  questType: QuestType;
  title: string;
  description: string;
  requirement: number;
  xpReward: number;
  active: boolean;
  createdAt: number;
}

export interface StakingInfo {
  totalStaked: string;
  totalRewards: string;
  lastRewardTime: number;
  locked: boolean;
}

export const SkillType = {
  CODING: 0,
  DESIGN: 1,
  MARKETING: 2,
  TRADING: 3,
  COMMUNITY: 4,
  WRITING: 5
} as const;

export type SkillType = typeof SkillType[keyof typeof SkillType];

export const Rarity = {
  COMMON: 0,
  UNCOMMON: 1,
  RARE: 2,
  EPIC: 3,
  LEGENDARY: 4
} as const;

export type Rarity = typeof Rarity[keyof typeof Rarity];

export const QuestType = {
  PURCHASE: 0,      // Comprar N NFTs
  CREATE: 1,        // Crear N NFTs
  SOCIAL: 2,        // Like/Comment N veces
  LEVEL_UP: 3,      // Alcanzar nivel N
  TRADING: 4        // Vender N NFTs
} as const;

export type QuestType = typeof QuestType[keyof typeof QuestType];

// ============================================
// Configuración de Contratos
// ============================================
// ⚠️ IMPORTANTE: Actualizar con auto-generated-addresses.json de Hardhat
// Este archivo se genera automáticamente ejecutando:
// npx hardhat run scripts/export-abis.ts --network polygon

export const CONTRACT_ADDRESSES: ContractAddresses = {
  // 📌 Contratos Principales
  GameifiedMarketplaceProxy: process.env.VITE_GAMEIFIED_MARKETPLACE_PROXY || '0xd502fB2Eb3d345EE9A5A0286A472B38c77Fda6d5',
  GameifiedMarketplaceCore: process.env.VITE_GAMEIFIED_MARKETPLACE_CORE || '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
  
  // 📌 Módulos de Habilidades y NFTs
  IndividualSkills: process.env.VITE_INDIVIDUAL_SKILLS || '0xB23257758B385444dF5A78aC2F315bd653470df3',
  GameifiedMarketplaceSkills: process.env.VITE_GAMEIFIED_MARKETPLACE_SKILLS || '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
  GameifiedMarketplaceQuests: process.env.VITE_GAMEIFIED_MARKETPLACE_QUESTS || '0x0165878A594ca255338adfa4d48449f69242Eb8F',
  
  // 📌 Sistema de Niveles y Referidos
  LevelingSystem: process.env.VITE_LEVELING_SYSTEM || '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
  ReferralSystem: process.env.VITE_REFERRAL_SYSTEM || '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
  
  // 📌 Contratos Individuales (deprecated/legacy)
  IndividualSkillsMarketplace: process.env.VITE_INDIVIDUAL_SKILLS_MARKETPLACE || '',
  IndividualSkillsMarketplaceImpl: process.env.VITE_INDIVIDUAL_SKILLS_MARKETPLACE_IMPL || '',
  
  // 📌 Staking y Rewards (módulos separados)
  EnhancedSmartStaking: process.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS || '0xC67F0a0cB719e4f4358D980a5D966878Fd6f3946',
  EnhancedSmartStakingRewards: process.env.VITE_ENHANCED_SMARTSTAKING_REWARDS_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  EnhancedSmartStakingSkills: process.env.VITE_ENHANCED_SMARTSTAKING_SKILLS_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  EnhancedSmartStakingGamification: process.env.VITE_ENHANCED_SMARTSTAKING_GAMIFICATION_ADDRESS || '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  EnhancedSmartStakingViewer: process.env.VITE_ENHANCED_SMARTSTAKING_VIEWER_ADDRESS || '0x97C24aC0Eb18b87Ea71312e1Ea415aE17D696462',
  
  // 📌 Utilidades
  DynamicAPYCalculator: process.env.VITE_DYNAMIC_APY_CALCULATOR_ADDRESS || '0x0B306BF915C4d645ff596e518fAf3F9669b97016',
  CollaboratorBadgeRewards: process.env.VITE_COLLABORATOR_BADGE_REWARDS_ADDRESS || '0x9A676e781A523b5d0C0e43731313A708CB607508',
  TreasuryManager: process.env.VITE_TREASURY_MANAGER_ADDRESS || '0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0',
  
  // 📌 Marketplace Views (lectura de datos)
  MarketplaceView: process.env.VITE_MARKETPLACE_VIEW || '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
  MarketplaceSocial: process.env.VITE_MARKETPLACE_SOCIAL || '0x610178dA211FEF7D417bC0e6FeD39F05609AD788',
  MarketplaceStatistics: process.env.VITE_MARKETPLACE_STATISTICS || '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e'
};

// ============================================
// Configuración de Red
// ============================================
export const CHAIN_CONFIG = {
  chainId: 137,
  chainName: 'Polygon',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18
  },
  rpcUrls: [
    'https://polygon-mainnet.g.alchemy.com/v2/Oyk0XqXD7K2HQO4bkbDm1w8iZQ6fHulV'
  ],
  blockExplorerUrls: ['https://polygonscan.com']
};

// ============================================
// Funciones Utilitarias
// ============================================
export const getBlockExplorerUrl = (txHash: string): string => {
  return `https://polygonscan.com/tx/${txHash}`;
};

export const getAddressExplorerUrl = (address: string): string => {
  return `https://polygonscan.com/address/${address}`;
};

export const getContractExplorerUrl = (contractAddress: string): string => {
  return `https://polygonscan.com/address/${contractAddress}#code`;
};

// ============================================
// Mapeos de Enums
// ============================================
export const SKILL_TYPE_NAMES = {
  [SkillType.CODING]: 'Coding',
  [SkillType.DESIGN]: 'Design',
  [SkillType.MARKETING]: 'Marketing',
  [SkillType.TRADING]: 'Trading',
  [SkillType.COMMUNITY]: 'Community',
  [SkillType.WRITING]: 'Writing'
};

export const RARITY_NAMES = {
  [Rarity.COMMON]: 'Common',
  [Rarity.UNCOMMON]: 'Uncommon',
  [Rarity.RARE]: 'Rare',
  [Rarity.EPIC]: 'Epic',
  [Rarity.LEGENDARY]: 'Legendary'
};

export const RARITY_COLORS = {
  [Rarity.COMMON]: '#A0AEC0',      // Gris
  [Rarity.UNCOMMON]: '#48BB78',    // Verde
  [Rarity.RARE]: '#4299E1',        // Azul
  [Rarity.EPIC]: '#9F7AEA',        // Púrpura
  [Rarity.LEGENDARY]: '#ED8936'    // Naranja
};

export const QUEST_TYPE_NAMES = {
  [QuestType.PURCHASE]: 'Purchase NFTs',
  [QuestType.CREATE]: 'Create NFTs',
  [QuestType.SOCIAL]: 'Social Engagement',
  [QuestType.LEVEL_UP]: 'Level Up',
  [QuestType.TRADING]: 'Trading Activity'
};

// ============================================
// Constantes de Contratos
// ============================================
export const CONTRACT_CONSTANTS = {
  PLATFORM_FEE_PERCENTAGE: 5,
  MIN_DEPOSIT_STAKING: 10,           // 10 MATIC
  MAX_DEPOSIT_STAKING: 10000,        // 10000 MATIC
  MAX_SKILLS_PER_NFT: 5,
  XP_PER_SKILL: {
    first: 15,
    others: 10
  }
};

// ============================================
// Interfaces de Transacciones
// ============================================
export interface TransactionOptions {
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  from: string;
  to: string;
  gasUsed: string;
  status: number;
}

// ============================================
// Importación de ABIs
// ============================================
// Los ABIs se cargan dinámicamente desde los archivos JSON
// Tipo genérico para ABIs (array de objetos ABI estándar)
export type AbiType = readonly Record<string, unknown>[];

// ABIs de Contratos Principales
import GameifiedMarketplaceProxyABI from './GameifiedMarketplaceProxy/GameifiedMarketplaceProxy.json';
import GameifiedMarketplaceCoreABI from './MarketplaceCore/GameifiedMarketplaceCoreV1.json';
import GameifiedMarketplaceSkillsABI from './GameifiedMarketplaceSkillsV2/GameifiedMarketplaceSkillsV2.json';
import GameifiedMarketplaceQuestsABI from './GameifiedMarketplaceQuests/GameifiedMarketplaceQuests.json';

// ABIs de Habilidades
import IndividualSkillsABI from './IndividualSkillsMarketplace/IndividualSkillsMarketplace.json';
import IndividualSkillsImplABI from './IndividualSkillsMarketplaceImpl/IndividualSkillsMarketplaceImpl.json';

// ABIs de Sistema de Niveles y Referidos
import LevelingSystemABI from './LevelingSystem/LevelingSystem.json';
import ReferralSystemABI from './ReferralSystem/ReferralSystem.json';

// ABIs de Smart Staking (módulos separados)
import EnhancedSmartStakingABI from './SmartStaking/EnhancedSmartStaking.json';
import EnhancedSmartStakingRewardsABI from './SmartStaking/EnhancedSmartStakingRewards.json';
import EnhancedSmartStakingSkillsABI from './SmartStaking/EnhancedSmartStakingSkills.json';
import EnhancedSmartStakingGamificationABI from './SmartStaking/EnhancedSmartStakingGamification.json';
import EnhancedSmartStakingViewABI from './SmartStaking/EnhancedSmartStakingView.json';

// ABIs de Utilidades
import DynamicAPYCalculatorABI from './DynamicAPYCalculator.sol/DynamicAPYCalculator.json';
import TreasuryManagerABI from './TreasuryManager/TreasuryManager.json';
import CollaboratorBadgeRewardsABI from './ColabRewards/CollaboratorBadgeRewards.json';

// ABIs de Marketplace Views (interfaces de lectura)
import IGameifiedMarketplaceABI from './interfaces/IGameifiedMarketplace.json';
import IStakingViewDataABI from './interfaces/IStakingViewData.json';

// Interfaz para los ABIs
export interface ContractABIs {
  // Contratos Principales
  GameifiedMarketplaceProxy: AbiType;
  GameifiedMarketplaceCore: AbiType;
  
  // Habilidades y NFTs
  IndividualSkills: AbiType;
  GameifiedMarketplaceSkills: AbiType;
  GameifiedMarketplaceQuests: AbiType;
  
  // Sistema de Niveles y Referidos
  LevelingSystem: AbiType;
  ReferralSystem: AbiType;
  
  // Contratos Individuales (legacy)
  IndividualSkillsMarketplace: AbiType;
  IndividualSkillsMarketplaceImpl: AbiType;
  
  // Smart Staking (módulos separados)
  EnhancedSmartStaking: AbiType;
  EnhancedSmartStakingRewards: AbiType;
  EnhancedSmartStakingSkills: AbiType;
  EnhancedSmartStakingGamification: AbiType;
  EnhancedSmartStakingViewer: AbiType;
  
  // Utilidades
  DynamicAPYCalculator: AbiType;
  TreasuryManager: AbiType;
  CollaboratorBadgeRewards: AbiType;
  
  // Marketplace Views
  MarketplaceView: AbiType;
  MarketplaceSocial: AbiType;
  MarketplaceStatistics: AbiType;
}

// Objeto compilado de ABIs
export const CONTRACT_ABIS: ContractABIs = {
  // Contratos Principales
  GameifiedMarketplaceProxy: (GameifiedMarketplaceProxyABI as unknown as { abi: AbiType }).abi,
  GameifiedMarketplaceCore: ((GameifiedMarketplaceCoreABI as unknown) as { abi: AbiType }).abi,
  
  // Habilidades y NFTs
  IndividualSkills: ((IndividualSkillsABI as unknown) as { abi: AbiType }).abi,
  GameifiedMarketplaceSkills: ((GameifiedMarketplaceSkillsABI as unknown) as { abi: AbiType }).abi,
  GameifiedMarketplaceQuests: ((GameifiedMarketplaceQuestsABI as unknown) as { abi: AbiType }).abi,
  
  // Sistema de Niveles y Referidos
  LevelingSystem: ((LevelingSystemABI as unknown) as { abi: AbiType }).abi,
  ReferralSystem: ((ReferralSystemABI as unknown) as { abi: AbiType }).abi,
  
  // Contratos Individuales (legacy)
  IndividualSkillsMarketplace: ((IndividualSkillsABI as unknown) as { abi: AbiType }).abi,
  IndividualSkillsMarketplaceImpl: ((IndividualSkillsImplABI as unknown) as { abi: AbiType }).abi,
  
  // Smart Staking (módulos separados)
  EnhancedSmartStaking: ((EnhancedSmartStakingABI as unknown) as { abi: AbiType }).abi,
  EnhancedSmartStakingRewards: ((EnhancedSmartStakingRewardsABI as unknown) as { abi: AbiType }).abi,
  EnhancedSmartStakingSkills: ((EnhancedSmartStakingSkillsABI as unknown) as { abi: AbiType }).abi,
  EnhancedSmartStakingGamification: ((EnhancedSmartStakingGamificationABI as unknown) as { abi: AbiType }).abi,
  EnhancedSmartStakingViewer: ((EnhancedSmartStakingViewABI as unknown) as { abi: AbiType }).abi,
  
  // Utilidades
  DynamicAPYCalculator: ((DynamicAPYCalculatorABI as unknown) as { abi: AbiType }).abi,
  TreasuryManager: ((TreasuryManagerABI as unknown) as { abi: AbiType }).abi,
  CollaboratorBadgeRewards: ((CollaboratorBadgeRewardsABI as unknown) as { abi: AbiType }).abi,
  
  // Marketplace Views (usando interfaces como fallback)
  MarketplaceView: ((IGameifiedMarketplaceABI as unknown) as { abi: AbiType }).abi,
  MarketplaceSocial: ((IGameifiedMarketplaceABI as unknown) as { abi: AbiType }).abi,
  MarketplaceStatistics: ((IStakingViewDataABI as unknown) as { abi: AbiType }).abi
};

// ============================================
// Utilidades para Obtener ABIs
// ============================================

/**
 * Obtiene el ABI de un contrato por nombre
 * @param contractName - Nombre del contrato (ej: 'GameifiedMarketplaceProxy')
 * @returns Array del ABI o undefined si no existe
 */
export function getContractABI(contractName: string): AbiType | undefined {
  return CONTRACT_ABIS[contractName as keyof ContractABIs];
}

/**
 * Obtiene la dirección de un contrato por nombre
 * @param contractName - Nombre del contrato
 * @returns Dirección del contrato o undefined
 */
export function getContractAddress(contractName: string): string | undefined {
  return CONTRACT_ADDRESSES[contractName as keyof ContractAddresses];
}
