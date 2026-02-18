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
  GameifiedMarketplaceProxy: import.meta.env.VITE_GAMEIFIED_MARKETPLACE_PROXY || '0x170972A6Fc2ABcC05CBd86bDC3AD05A310876C3b',
  GameifiedMarketplaceCore: import.meta.env.VITE_GAMEIFIED_MARKETPLACE_CORE || '0x170972A6Fc2ABcC05CBd86bDC3AD05A310876C3b',
  
  // 📌 Módulos de Habilidades y NFTs
  IndividualSkills: import.meta.env.VITE_INDIVIDUAL_SKILLS || '0xAD586A4Fe790975f80382De018788951D33f10f8',
  GameifiedMarketplaceSkills: import.meta.env.VITE_GAMEIFIED_MARKETPLACE_SKILLS || '0x304763fF9C345DA1Fe32d80A47f0F4aeb31E05cd',
  GameifiedMarketplaceQuests: import.meta.env.VITE_GAMEIFIED_MARKETPLACE_QUESTS || '0x00ABC70504b1d8B75Bb07257e240BAc38d204B73',
  
  // 📌 Sistema de Niveles y Referidos
  LevelingSystem: import.meta.env.VITE_LEVELING_SYSTEM || '0x700FD6c0ca996C5D62B29F0F57528c9B63De90Fb',
  ReferralSystem: import.meta.env.VITE_REFERRAL_SYSTEM || '0xbb6DE66b0F38a4781F9fA9d4e9E66F9C4661C12C',
  
  // 📌 Contratos Individuales (deprecated/legacy)
  IndividualSkillsMarketplace: import.meta.env.VITE_INDIVIDUAL_SKILLS_MARKETPLACE || '',
  IndividualSkillsMarketplaceImpl: import.meta.env.VITE_INDIVIDUAL_SKILLS_MARKETPLACE_IMPL || '',
  
  // 📌 Staking y Rewards (módulos separados)
  EnhancedSmartStaking: import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS || '0x5F084a3E35eca396B5216d67D31CB0c8dcC22703',
  EnhancedSmartStakingRewards: import.meta.env.VITE_ENHANCED_SMARTSTAKING_REWARDS_ADDRESS || '0xC72C9BdfEDbAA68C75D1De98e0992E1aA2a0C4be',
  EnhancedSmartStakingSkills: import.meta.env.VITE_ENHANCED_SMARTSTAKING_SKILLS_ADDRESS || '0x6ADD8eAdE8B2A4d8B8DE032Cf5CaB4b04481351c',
  EnhancedSmartStakingGamification: import.meta.env.VITE_ENHANCED_SMARTSTAKING_GAMIFICATION_ADDRESS || '0xcA4E14cd5788C5bA705051f991e65a34fbC79B52',
  EnhancedSmartStakingViewer: import.meta.env.VITE_ENHANCED_SMARTSTAKING_VIEWER_ADDRESS || '0x753faAD8088ef6B5fC2859bf84C097f1d8207c3c',
  
  // 📌 Utilidades
  DynamicAPYCalculator: import.meta.env.VITE_DYNAMIC_APY_CALCULATOR_ADDRESS || '0xbC83dB057224973209E3F2D6A41471ab5204f4c0',
  CollaboratorBadgeRewards: import.meta.env.VITE_COLLABORATOR_BADGE_REWARDS_ADDRESS || '0x579DDf1afF17ef176de1fB8A6b8CbCA628792d98',
  TreasuryManager: import.meta.env.VITE_TREASURY_MANAGER_ADDRESS || '0x92BA711B203CF40bb6c5f7f509E0f48aa19e2cD9',
  
  // 📌 Marketplace Views (lectura de datos)
  MarketplaceView: import.meta.env.VITE_MARKETPLACE_VIEW || '0x80fa89CB50Bf9501D2E25C7Aa191822119B76439',
  MarketplaceSocial: import.meta.env.VITE_MARKETPLACE_SOCIAL || '0xe39C0C008624b8649270C4e99AeD0892C7b6fD8d',
  MarketplaceStatistics: import.meta.env.VITE_MARKETPLACE_STATISTICS || '0x83b75f1AC33a9257072f6f070266A3D89Cdf4CA3'
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
import GameifiedMarketplaceCoreABI from './Marketplace/GameifiedMarketplaceCoreV1.json';
import GameifiedMarketplaceSkillsABI from './Marketplace/GameifiedMarketplaceSkillsNft.json';
import GameifiedMarketplaceQuestsABI from './Marketplace/GameifiedMarketplaceQuests.json';

// ABIs de Habilidades
import IndividualSkillsABI from './Marketplace/IndividualSkillsMarketplace.json';
import IndividualSkillsImplABI from './Marketplace/IndividualSkillsMarketplaceImpl.json';

// ABIs de Sistema de Niveles y Referidos
import LevelingSystemABI from './Marketplace/LevelingSystem.json';
import ReferralSystemABI from './Marketplace/ReferralSystem.json';

// ABIs de Smart Staking (módulos separados)
import EnhancedSmartStakingABI from './Marketplace/IEnhancedSmartStaking.json';
import EnhancedSmartStakingRewardsABI from './SmartStaking/EnhancedSmartStakingRewards.json';
import EnhancedSmartStakingSkillsABI from './SmartStaking/EnhancedSmartStakingSkills.json';
import EnhancedSmartStakingGamificationABI from './SmartStaking/EnhancedSmartStakingGamification.json';
import EnhancedSmartStakingViewABI from './SmartStaking/EnhancedSmartStakingView.json';

// ABIs de Utilidades
import DynamicAPYCalculatorABI from './DynamicAPYCalculator.sol/DynamicAPYCalculator.json';
import TreasuryManagerABI from './Treasury/TreasuryManager.json';
import CollaboratorBadgeRewardsABI from './Marketplace/CollaboratorBadgeRewards.json';

// ABIs de Marketplace Views (interfaces de lectura)
import IGameifiedMarketplaceABI from './IGameifiedMarketplace/IGameifiedMarketplace.json';
import IStakingViewDataABI from './SmartStaking/IStakingViewData.json';

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
