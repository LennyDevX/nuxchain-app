/**
 * Contract Configuration para Frontend
 * Direcciones y ABIs - Polygon Mainnet
 * Fecha: 11 de Noviembre de 2025
 */

// ============================================
// Tipos TypeScript - Actualizados para nueva arquitectura
// ============================================
export interface ContractAddresses {
  GameifiedMarketplaceProxy: string;  // Proxy principal (UUPS upgradeable)
  GameifiedMarketplaceCore: string;   // Implementation contract
  GameifiedMarketplaceSkills: string; // Módulo de Skills
  GameifiedMarketplaceQuests: string; // Módulo de Quests
  EnhancedSmartStaking: string;       // Staking contract
}

export interface UserProfile {
  totalXP: bigint;
  level: number;
  nftsCreated: bigint;
  nftsOwned: bigint;
  nftsSold: number;
  nftsBought: number;
}

export interface Skill {
  skillType: SkillType;
  rarity: Rarity;
  level: bigint;
  createdAt: bigint;
}

export interface Quest {
  questId: bigint;
  questType: QuestType;
  title: string;
  description: string;
  requirement: bigint;
  xpReward: bigint;
  active: boolean;
  createdAt: bigint;
}

export interface StakingInfo {
  totalStaked: string;
  totalRewards: string;
  lastRewardTime: number;
  locked: boolean;
}

// ⚠️ IMPORTANTE: Estos valores deben coincidir EXACTAMENTE con el contrato inteligente
// Nueva arquitectura modular - estos son MARKETPLACE skills, no staking skills
export const SkillType = {
  CODING: 0,      // Programación/Desarrollo
  DESIGN: 1,      // Diseño/Arte
  MARKETING: 2,   // Marketing/Promoción
  TRADING: 3,     // Trading/Ventas
  COMMUNITY: 4,   // Gestión de comunidad
  WRITING: 5      // Escritura/Contenido
} as const;

export type SkillType = typeof SkillType[keyof typeof SkillType];

// ✅ Mapeo de nombres para mostrar en UI
export const MARKETPLACE_SKILL_NAMES: Record<SkillType, string> = {
  [SkillType.CODING]: '💻 Coding',
  [SkillType.DESIGN]: '🎨 Design',
  [SkillType.MARKETING]: '📢 Marketing',
  [SkillType.TRADING]: '💹 Trading',
  [SkillType.COMMUNITY]: '👥 Community',
  [SkillType.WRITING]: '✍️ Writing'
} as const;

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
// Configuración de Contratos - NUEVA ARQUITECTURA MODULAR
// ============================================
// 📌 NOTA: Estos direcciones se cargan desde .env y se validan en tiempo de ejecución
// Usar siempre VITE_GAMEIFIED_MARKETPLACE_PROXY para interactuar con el core

// ✅ Validar variables de entorno críticas
const validateContractAddress = (address: string | undefined, name: string): string => {
  if (!address) {
    const errorMsg = `❌ CRITICAL ERROR: ${name} no está configurado en variables de entorno`;
    console.error(errorMsg);
    if (typeof window !== 'undefined') {
      console.error(`📌 Asegúrate de que ${name} está definido en:`, {
        location: 'Vercel Environment Variables o .env file',
        value: 'debe ser una dirección válida 0x...'
      });
    }
    return '0x0000000000000000000000000000000000000000'; // Fallback dummy address
  }
  return address;
};

export const CONTRACT_ADDRESSES: ContractAddresses = {
  // 📌 DIRECCIÓN DEL PROXY (PERMANENTE - USA ESTA PARA INTERACTUAR)
  // Este es el punto de entrada principal - es upgradeable via UUPS
  GameifiedMarketplaceProxy: validateContractAddress(
    import.meta.env.VITE_GAMEIFIED_MARKETPLACE_PROXY,
    'VITE_GAMEIFIED_MARKETPLACE_PROXY'
  ),
  
  // Implementation contract (para upgrades, no usar directamente)
  // Solo útil para verificación en explorer, el proxy redirecciona
  GameifiedMarketplaceCore: validateContractAddress(
    import.meta.env.VITE_GAMEIFIED_MARKETPLACE_CORE,
    'VITE_GAMEIFIED_MARKETPLACE_CORE'
  ),
  
  // Módulos satelite - usar estos para funciones específicas
  GameifiedMarketplaceSkills: validateContractAddress(
    import.meta.env.VITE_GAMEIFIED_MARKETPLACE_SKILLS,
    'VITE_GAMEIFIED_MARKETPLACE_SKILLS'
  ),
  GameifiedMarketplaceQuests: validateContractAddress(
    import.meta.env.VITE_GAMEIFIED_MARKETPLACE_QUESTS,
    'VITE_GAMEIFIED_MARKETPLACE_QUESTS'
  ),
  
  // Staking - sincronizado con Marketplace
  EnhancedSmartStaking: validateContractAddress(
    import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS,
    'VITE_ENHANCED_SMARTSTAKING_ADDRESS'
  )
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
